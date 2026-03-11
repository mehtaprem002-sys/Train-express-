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
                const initialStatus = generateAvailability(trainNumber, travelDate, classType);
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
                classesMap[classType] = generateAvailability(trainNumber, travelDate, classType);
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

        // Helper to determine coach and seats
        const assignSeats = (classType, passengers, selectedSeats) => {
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
            passengers: passengersWithSeats,
            pnr,
            status: 'Confirmed'
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
        // Robust class extraction: Handle both object { type: 'SL' } and string 'SL'
        const rawClass = booking.class;
        const classType = (rawClass && typeof rawClass === 'object' && rawClass.type) ? rawClass.type : rawClass;

        const passengerCount = (booking.passengers || []).length;

        if (trainNumber && travelDate && classType) {
            const availDoc = await Availability.findOne({ trainNumber, date: travelDate });
            if (availDoc) {
                const classesMap = availDoc.classes instanceof Map ? Object.fromEntries(availDoc.classes) : availDoc.classes;
                const currentStatus = classesMap[classType];

                if (currentStatus) {
                    if (currentStatus.status === 'AVL') {
                        currentStatus.count += passengerCount;
                        currentStatus.text = `AVL ${currentStatus.count}`;
                    } else if (currentStatus.status === 'WL') {
                        if (currentStatus.count > 0) {
                            currentStatus.count = Math.max(0, currentStatus.count - passengerCount);
                            // If it becomes 0, it stays WL 0 (Waitlist empty but train full)
                            // However, usually if you cancel a WL ticket, you just remove yourself from WL.
                            // If you are confirming a WL ticket because someone else cancelled, that is a different flow (allocating seat).
                            // Here we assume "user cancelled their ticket".
                            // If user was WL, WL count decreases.
                            // If user was CNF (which implies status was AVL or WL passed), this logic is tricky.
                            // Simplified Assumption: If status is WL, only WL tickets can be cancelled? 
                            // No, a confirmed ticket can be cancelled while status is WL.
                            // IF status is WL, and a Confirmed ticket is cancelled -> Availability increases (WL count decreases? No, seat becomes available for WL).
                            // Correct Logic for "Real-time view":
                            // If status IS WL, and a booking is cancelled:
                            // We should move one person from WL to CNF (conceptually).
                            // So, WL count decreases.
                            // If WL count becomes 0, does it switch to AVL?
                            // Only if we have MORE seats than WL.
                            // Let's stick to the requested simple logic: "If available seats hit zero, new bookings WL. If someone cancels, reduce WL first before raising available seats."

                            currentStatus.text = `WL ${currentStatus.count}`;

                            // If WL becomes negative (more cancellations than WL people), switch to AVL
                            // But here we did Math.max(0...), so it stops at WL 0.
                            // Check if we gained extra seats?
                            // The prompt says: "reduce waiting list before raising available seats"
                            // So if WL is 2, cancel 1 -> WL 1.
                            // If WL is 1, cancel 1 -> WL 0.
                            // If WL is 0, cancel 1 -> THIS should become AVL 1.
                            // My current logic above stuck at WL 0. Fix:

                            // Let's re-eval:
                            // We need to know the NET change.
                            // Actually, if I cancel a ticket, I am freeing up a resource.
                            // If status is WL, that resource goes to the WL queue.
                            // So WL count decreases.

                            // What if WL count was ALREADY 0? (Meaning train full, no waitlist).
                            // Then we transform to AVL.
                        }

                        // Re-implementing based on "reduce waiting list before raising available seats"
                        // This implies we simply subtract from WL count.
                        // But we need to handle the transition to AVL if WL is empty.

                        // Determine effective count change
                        // existing WL count - passengers cancelled
                        let netWL = currentStatus.count - passengerCount;

                        if (netWL < 0) {
                            // We cleared the WL and have extra seats
                            currentStatus.status = 'AVL';
                            currentStatus.count = Math.abs(netWL);
                            currentStatus.text = `AVL ${currentStatus.count}`;
                            currentStatus.color = 'text-green-600 dark:text-green-400';
                            currentStatus.bg = 'bg-green-100 dark:bg-green-900/30';
                        } else {
                            // Still in WL or exactly 0
                            currentStatus.count = netWL;
                            currentStatus.text = `WL ${currentStatus.count}`;
                        }
                    }

                    if (availDoc.classes instanceof Map) {
                        availDoc.classes.set(classType, currentStatus);
                    } else {
                        availDoc.classes = classesMap;
                        availDoc.markModified('classes');
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
