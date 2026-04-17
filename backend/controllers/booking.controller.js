const Booking = require('../models/Booking');
const { generateBookingPDF } = require('../utils/pdfGenerator');

// ... existing code ...

exports.getBookingPDF = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.pnr || 'download'}.pdf`);

        generateBookingPDF(booking, res);
    } catch (err) {
        console.error('PDF Generation Error:', err);
        res.status(500).json({ message: 'Server error generating PDF' });
    }
};
const Availability = require('../models/Availability');
const { generateAvailability } = require('./train.controller');

exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        console.log(`[createBooking] Received selectedSeats:`, JSON.stringify(bookingData.selectedSeats));
        console.log(`[createBooking] Passengers count:`, bookingData.passengers?.length);

        // Basic validation
        if (!bookingData.user || !bookingData.train || !bookingData.paymentDetails) {
            return res.status(400).json({ error: 'Invalid booking data' });
        }

        // --- AVAILABILITY UPDATE LOGIC ---
        const trainNumber = bookingData.train.number;
        const travelDate = bookingData.date;
        const classType = bookingData.class ? bookingData.class.type : 'SL';
        const passengerCount = bookingData.passengers ? bookingData.passengers.length : 1;

        if (trainNumber && travelDate) {
            // Check if availability doc exists, if not create it based on default generation
            let availDoc = await Availability.findOne({ trainNumber, date: travelDate });

            if (!availDoc) {
                // Initialize default
                let initialStatus = null;
                const Train = require('../models/Train');
                const trainObj = await Train.findOne({ number: trainNumber });
                
                if (trainObj && trainObj.overrides) {
                    const override = trainObj.overrides.find(o => o.date === travelDate && o.classType === classType);
                    if (override) {
                        if (override.availableSeats > 0) {
                            initialStatus = { status: 'AVL', count: override.availableSeats, text: `AVL ${override.availableSeats}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
                        } else if (override.waitlistSeats > 0) {
                            initialStatus = { status: 'WL', count: override.waitlistSeats, text: `WL ${override.waitlistSeats}`, color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
                        } else if (override.availableSeats === 0 || override.waitlistSeats === 0) {
                            initialStatus = { status: 'REGRET', count: 0, text: 'REGRET', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
                        }
                    }
                }

                if (!initialStatus) {
                    initialStatus = generateAvailability(trainNumber, travelDate, classType);
                }

                availDoc = new Availability({
                    trainNumber,
                    date: travelDate,
                    classes: {
                        [classType]: initialStatus
                    }
                });
            }

            // Ensure class exists in doc
            const classesMap = availDoc.classes instanceof Map ? Object.fromEntries(availDoc.classes) : availDoc.classes;
            if (!classesMap[classType]) {
                let classStatus = null;
                const Train = require('../models/Train');
                const trainObj = await Train.findOne({ number: trainNumber });
                if (trainObj && trainObj.overrides) {
                    const override = trainObj.overrides.find(o => o.date === travelDate && o.classType === classType);
                    if (override) {
                        if (override.availableSeats > 0) classStatus = { status: 'AVL', count: override.availableSeats, text: `AVL ${override.availableSeats}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
                        else if (override.waitlistSeats > 0) classStatus = { status: 'WL', count: override.waitlistSeats, text: `WL ${override.waitlistSeats}`, color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
                        else if (override.availableSeats === 0 || override.waitlistSeats === 0) classStatus = { status: 'REGRET', count: 0, text: 'REGRET', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
                    }
                }
                if (!classStatus) classStatus = generateAvailability(trainNumber, travelDate, classType);
                classesMap[classType] = classStatus;
            }

            const currentStatus = classesMap[classType];

            // Core Logic for decrementing
            if (currentStatus.status === 'AVL') {
                currentStatus.count = currentStatus.count - passengerCount;
                if (currentStatus.count <= 0) {
                    currentStatus.status = 'WL';
                    currentStatus.count = Math.abs(currentStatus.count); // Convert negative to positive WL count
                    if (currentStatus.count === 0) currentStatus.count = 0; // WL 0 if exactly 0

                    currentStatus.text = `WL ${currentStatus.count}`;
                    currentStatus.color = 'text-yellow-700 dark:text-yellow-400';
                    currentStatus.bg = 'bg-yellow-100 dark:bg-yellow-900/30';
                } else {
                    currentStatus.text = `AVL ${currentStatus.count}`;
                }
            } else if (currentStatus.status === 'WL') {
                currentStatus.count += passengerCount;
                currentStatus.text = `WL ${currentStatus.count}`;
            }

            // Save updates (Atomic replacement of the specific class object/map entry is complex in Mongoose maps without full save)
            // Simpler: Update the specific class field.
            // Since we are not using transactions (standalone mongo), query+save has race conditions but acceptable for MVP.
            // Ideally we use findOneAndUpdate with specific logic but custom logic 'inside' the object is hard in one query.
            // We'll stick to save() for simplicity here.

            // Re-assign back to ensure mongoose detects change if it was POJO conversion
            if (availDoc.classes instanceof Map) {
                availDoc.classes.set(classType, currentStatus);
            } else {
                availDoc.classes = classesMap;
                availDoc.markModified('classes'); // Essential for Mixed types
            }

            await availDoc.save();
        }
        // ---------------------------------

        // Generate PNR
        const pnr = bookingData.pnr || Math.floor(1000000000 + Math.random() * 9000000000).toString();

        let isWaitlisted = bookingData.isWaitlisted === true;
        if (!isWaitlisted) {
            if (bookingData.status === 'Waitlist' || bookingData.status === 'Waitlisted') isWaitlisted = true;
            else if (bookingData.class?.availability?.status === 'WL') isWaitlisted = true;
            else if (bookingData.class?.availability?.text?.startsWith('WL')) isWaitlisted = true;
        }

        // Helper to determine coach and seats
        const assignSeats = (classType, passengers, selectedSeats) => {
            if (isWaitlisted) {
                return passengers.map((p) => ({
                    ...p,
                    coach: 'WL',
                    seatNumber: null,
                    berth: null,
                    berthType: 'Waitlist',
                    status: 'WL'
                }));
            }

            let coachPrefix = 'D1';
            const type = (classType || '').toString().toUpperCase();

            if (type.includes('1A') || type.includes('FIRST')) coachPrefix = 'H' + (Math.floor(Math.random() * 2) + 1);
            else if (type.includes('2A') || type.includes('2 TIER')) coachPrefix = 'A' + (Math.floor(Math.random() * 3) + 1);
            else if (type.includes('3A') || type.includes('3 TIER')) coachPrefix = 'B' + (Math.floor(Math.random() * 6) + 1);
            else if (type.includes('CC') || type.includes('CHAIR')) coachPrefix = 'C' + (Math.floor(Math.random() * 4) + 1);
            else if (type.includes('SL') || type.includes('SLEEPER')) coachPrefix = 'S' + (Math.floor(Math.random() * 10) + 1);
            else if (type.includes('EC') || type.includes('EXEC')) coachPrefix = 'E' + (Math.floor(Math.random() * 2) + 1);
            else if (type.includes('2S') || type.includes('SECOND')) coachPrefix = 'D' + (Math.floor(Math.random() * 6) + 1);

            if (selectedSeats && selectedSeats.length === passengers.length) {
                // Use User Selected Seats
                return passengers.map((p, index) => {
                    const seat = selectedSeats[index];
                    return {
                        ...p,
                        coach: coachPrefix,
                        seatNumber: seat.number,
                        berth: seat.number, // Simplified
                        berthType: seat.type,
                        status: 'CNF'
                    };
                });
            }

            // Fallback to Random Assignment
            let maxSeats = 100;
            const startSeat = Math.floor(Math.random() * (60)) + 1;

            return passengers.map((p, index) => {
                const seatNo = startSeat + index;

                let berthType = 'Seat';
                if (['S1', 'B1', 'A1', 'H1'].includes(coachPrefix)) {
                    const mod8 = seatNo % 8;
                    if (mod8 === 1 || mod8 === 4) berthType = 'Lower';
                    else if (mod8 === 2 || mod8 === 5) berthType = 'Middle';
                    else if (mod8 === 3 || mod8 === 6) berthType = 'Upper';
                    else if (mod8 === 7) berthType = 'Side Lower';
                    else if (mod8 === 0) berthType = 'Side Upper';

                    if (coachPrefix === 'A1' && berthType === 'Middle') berthType = 'Upper';
                    if (coachPrefix === 'H1') berthType = (seatNo % 2 === 0) ? 'Upper' : 'Lower';
                }

                if (['C1', 'E1', 'D1'].includes(coachPrefix)) {
                    const mod3 = seatNo % 3;
                    if (mod3 === 1) berthType = 'Window';
                    else if (mod3 === 2) berthType = 'Middle';
                    else berthType = 'Aisle';
                }

                return {
                    ...p,
                    coach: coachPrefix,
                    seatNumber: seatNo,
                    berth: seatNo,
                    berthType: berthType,
                    status: 'CNF'
                };
            });
        };

        const passengersWithSeats = assignSeats(classType, bookingData.passengers, bookingData.selectedSeats);

        const finalBooking = new Booking({
            ...bookingData,
            date: bookingData.date, // Explicitly ensure top-level date is saved
            passengers: passengersWithSeats,
            pnr,
            status: isWaitlisted ? 'Waitlist' : 'Confirmed'
        });

        const savedBooking = await finalBooking.save();

        res.status(201).json({ id: savedBooking._id, ...savedBooking.toObject() });
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ id: booking._id, ...booking.toObject() });
    } catch (error) {
        console.error('Get Booking By ID Error:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

exports.getBookingByPnr = async (req, res) => {
    try {
        const { pnr } = req.params;
        const booking = await Booking.findOne({ pnr });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ id: booking._id, ...booking.toObject() });
    } catch (error) {
        console.error('Get Booking By PNR Error:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        // User ID in Mongo might be Object ID string, but in our booking user sub-object it is stored as 'id' string.
        const bookings = await Booking.find({
            'user.id': userId,
            hidden: { $ne: true }
        }).sort({ createdAt: -1 });

        const bookingsList = bookings.map(b => ({
            id: b._id,
            ...b.toObject()
        }));

        res.json(bookingsList);
    } catch (error) {
        console.error('Get Bookings Error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        const bookingsList = bookings.map(b => ({
            id: b._id,
            ...b.toObject()
        }));
        res.json(bookingsList);
    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({ error: 'Failed to fetch all bookings' });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'Cancelled') {
            return res.status(400).json({ message: 'Only cancelled bookings can be deleted' });
        }

        // Soft delete for users, keeping it visible for admins
        booking.hidden = true;
        await booking.save();

        res.json({ message: 'Booking removed from user history' });
    } catch (error) {
        console.error('Delete Booking Error:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
};

exports.deleteBookingAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'Cancelled') {
            return res.status(400).json({ message: 'Only cancelled bookings can be deleted' });
        }

        await Booking.findByIdAndDelete(id);
        res.json({ message: 'Booking completely removed from database by admin' });
    } catch (error) {
        console.error('Admin Delete Booking Error:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Attempting to cancel booking ID: ${id}`);

        const booking = await Booking.findById(id);

        if (!booking) {
            console.error(`[DEBUG] Booking ID ${id} not found.`);
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        // --- AVAILABILITY ROLLBACK LOGIC ---
        const trainNumber = booking.train?.number;
        const travelDate = booking.date || booking.train?.date; 
        console.log(`[DEBUG] Cancellation sync attempt for train=${trainNumber}, date=${travelDate}`);
        
        // Robust class extraction: Handle both object { type: 'SL' } and string 'SL'
        const rawClass = booking.class;
        const classType = (rawClass && typeof rawClass === 'object' && rawClass.type) ? rawClass.type : rawClass;

        const passengerCount = (booking.passengers || []).length;

        if (trainNumber && travelDate && classType) {
            let availDoc = await Availability.findOne({ trainNumber, date: travelDate });

            if (!availDoc) {
                console.log(`[DEBUG] Availability doc missing for cancellation. Creating new one for ${trainNumber} on ${travelDate}`);
                availDoc = new Availability({ trainNumber, date: travelDate, classes: {} });
            }

            // Handle Map vs Object
            let classesMap = {};
            if (availDoc.classes instanceof Map) {
                classesMap = Object.fromEntries(availDoc.classes);
            } else {
                classesMap = availDoc.classes || {};
            }

            let currentStatus = classesMap[classType];

            if (!currentStatus) {
                console.log(`[DEBUG] Class entry ${classType} missing in Availability. Initializing from Train defaults.`);
                // Fallback to a default state if missing, so we can at least increment from 0
                currentStatus = { status: 'WL', count: 0, text: 'WL 0' };
            }

            if (currentStatus) {
                console.log(`[DEBUG] Current state for ${classType}: ${currentStatus.status} ${currentStatus.count}`);
                if (currentStatus.status === 'AVL') {
                    currentStatus.count += passengerCount;
                    currentStatus.text = `AVL ${currentStatus.count}`;
                } else if (currentStatus.status === 'WL') {
                    // Determine effective count change: existing WL count - passengers cancelled
                    let netWL = (currentStatus.count || 0) - passengerCount;

                    if (netWL < 0) {
                        // If netWL is negative, it means we have cleared the waitlist 
                        // and have extra seats available.
                        currentStatus.status = 'AVL';
                        currentStatus.count = Math.abs(netWL);
                        currentStatus.text = `AVL ${currentStatus.count}`;
                        currentStatus.color = 'text-green-600 dark:text-green-400';
                        currentStatus.bg = 'bg-green-100 dark:bg-green-900/30';
                        console.log(`[DEBUG] Transitioned from WL to AVL. New Count: ${currentStatus.count}`);
                    } else {
                    }
                    await availDoc.save();
                }
            }
        }
        // -----------------------------------

        // Calculate Refund
        const totalAmount = booking.paymentDetails.amount;
        const refundAmount = Math.round(totalAmount * 0.80);
        const penalties = totalAmount - refundAmount;

        booking.status = 'Cancelled';
        booking.cancellationDetails = {
            date: new Date(),
            penalty: penalties,
            refundAmount: refundAmount,
            reason: 'User Requested'
        };

        await booking.save();

        res.json({
            message: 'Booking cancelled successfully',
            bookingId: id,
            refundAmount,
            status: 'Cancelled'
        });

    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

exports.getBookedSeats = async (req, res) => {
    try {
        const { trainNumber, date, classType } = req.query;
        console.log(`[getBookedSeats] Query: train=${trainNumber}, date=${date}, class=${classType}`);

        if (!trainNumber || !date || !classType) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const bookings = await Booking.find({
            'train.number': trainNumber,
            // The booking model saves the travel date at the top-level 'date' field
            'date': date,
            'status': { $ne: 'Cancelled' }
        });

        console.log(`[getBookedSeats] Found ${bookings.length} non-cancelled bookings for this train/date.`);

        // Filter bookings by class and extract seats
        const bookedSeatNumbers = [];
        bookings.forEach(b => {
            const rawClass = b.class;
            const bClassType = (rawClass && typeof rawClass === 'object' && rawClass.type) ? rawClass.type : rawClass;

            if (bClassType === classType && b.passengers) {
                b.passengers.forEach(p => {
                    // The backend assigns coach randomly but seatNumber deterministically for users
                    // We just block the seatNumber for now as UI shows a generic layout
                    if (p.seatNumber) bookedSeatNumbers.push(p.seatNumber);
                    if (p.berth && !p.seatNumber) bookedSeatNumbers.push(p.berth); // Fallback for some old records
                });
            }
        });

        console.log(`[getBookedSeats] Returning booked seats for class ${classType}:`, bookedSeatNumbers);
        res.json(bookedSeatNumbers);
    } catch (error) {
        console.error('Get Booked Seats Error:', error);
        res.status(500).json({ error: 'Failed to fetch booked seats' });
    }
};

exports.confirmWaitlistAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'Waitlist' && booking.status !== 'Waitlisted') {
            return res.status(400).json({ message: 'Only waitlisted bookings can be confirmed by admin' });
        }

        // Assign random seats for the passengers
        let maxSeats = 100;
        const startSeat = Math.floor(Math.random() * (60)) + 1;
        
        let coachPrefix = 'S' + (Math.floor(Math.random() * 10) + 1); // default fallback to Sleeper

        // Try to derive coach from class type
        const type = (booking.class?.type || '').toString().toUpperCase();
        if (type.includes('1A') || type.includes('FIRST')) coachPrefix = 'H' + (Math.floor(Math.random() * 2) + 1);
        else if (type.includes('2A') || type.includes('2 TIER')) coachPrefix = 'A' + (Math.floor(Math.random() * 3) + 1);
        else if (type.includes('3A') || type.includes('3 TIER')) coachPrefix = 'B' + (Math.floor(Math.random() * 6) + 1);
        else if (type.includes('CC') || type.includes('CHAIR')) coachPrefix = 'C' + (Math.floor(Math.random() * 4) + 1);

        booking.passengers = booking.passengers.map((p, index) => {
            const seatNo = startSeat + index;
            let berthType = 'Seat';
            if (['S1', 'B1', 'A1', 'H1'].includes(coachPrefix)) {
                const mod8 = seatNo % 8;
                if (mod8 === 1 || mod8 === 4) berthType = 'Lower';
                else if (mod8 === 2 || mod8 === 5) berthType = 'Middle';
                else if (mod8 === 3 || mod8 === 6) berthType = 'Upper';
                else if (mod8 === 7) berthType = 'Side Lower';
                else if (mod8 === 0) berthType = 'Side Upper';
            }
            if (['C1', 'E1', 'D1'].includes(coachPrefix)) {
                const mod3 = seatNo % 3;
                if (mod3 === 1) berthType = 'Window';
                else if (mod3 === 2) berthType = 'Middle';
                else berthType = 'Aisle';
            }

            return {
                ...p,
                coach: coachPrefix,
                seatNumber: seatNo,
                berth: seatNo,
                berthType: berthType,
                status: 'CNF'
            };
        });

        booking.status = 'Confirmed';
        await booking.save();

        res.json({ message: 'Waitlisted booking successfully confirmed by admin', booking });
    } catch (error) {
        console.error('Admin Confirm WL Error:', error);
        res.status(500).json({ error: 'Failed to confirm waitlisted booking' });
    }
};
