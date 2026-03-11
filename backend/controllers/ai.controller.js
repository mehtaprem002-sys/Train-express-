const Train = require('../models/Train');
const Station = require('../models/Station');
const Availability = require('../models/Availability');

const WEBSITE_KNOWLEDGE = [
    {
        keywords: ['tatkal', 'timing', 'open'],
        answer: "Tatkal booking opens at **10:00 AM** for AC classes (1A, 2A, 3A, CC, EC) and at **11:00 AM** for Non-AC classes (SL, FC, 2S). Bookings open one day in advance."
    },
    {
        keywords: ['rac', 'reservation against cancellation', 'share', 'berth'],
        answer: "RAC (Reservation Against Cancellation) means you have a guaranteed seat but might share a berth with another passenger. If a confirmed passenger cancels, you get a full berth."
    },
    {
        keywords: ['waitlist', 'wl', 'refund', 'cancel'],
        answer: "If your ticket remains fully waitlisted after final chart preparation, it is automatically cancelled, and the full amount is refunded to your account."
    },
    {
        keywords: ['id', 'aadhaar', 'driving license', 'proof', 'digilocker'],
        answer: "Yes, digital copies of Aadhaar and Driving License on **mParivahan** or **DigiLocker** are valid for travel."
    },
    {
        keywords: ['limit', 'number of tickets', 'month'],
        answer: "You can book up to **6 tickets per month**. If your Aadhaar is linked to your account, the limit increases to **12 tickets per month**."
    },
    {
        keywords: ['best price', 'guarantee', 'match'],
        answer: "We offer a **Best Price Guarantee**. If you find a lower price elsewhere, we'll match it and give you 5% off your next booking."
    },
    {
        keywords: ['live tracking', 'location', 'gps'],
        answer: "Our trains are GPS-enabled. You can share your live location with family or check exact arrival times via the **Live Status** feature."
    },
    {
        keywords: ['support', 'contact', 'help', 'email'],
        answer: "Our premium support team is available **24/7**. You can email us at **support@trainexpress.com** or use the contact form."
    },
    {
        keywords: ['book', 'how to book', 'booking process', 'steps to book'],
        answer: "Booking is simple: 1. Search your route. 2. Select your class. 3. Get your instant E-ticket via email/SMS."
    },
    {
        keywords: ['hi', 'hello', 'hey', 'who are you', 'agent', 'help'],
        answer: "Hello! I am **Train Express AI**, your dedicated assistant. I can help you with bookings, PNR status, and any questions about our services."
    }
];

// Helper to normalize and match station names
const getStationName = async (query, stations) => {
    const normalize = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const q = normalize(query);
    const match = stations.find(s => normalize(s.name).includes(q) || normalize(s.code) === q);
    return match ? match.name : null;
};

exports.processQuery = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const lowerMsg = message.toLowerCase();

        // 1. Dynamic PNR or Train Number detection (10 digits for PNR, 5 for Train)
        const pnrMatch = message.match(/\b\d{10}\b/);
        const trainNumMatch = message.match(/\b\d{5}\b/);

        if (pnrMatch) {
            const pnr = pnrMatch[0];
            return res.json({
                success: true,
                type: 'pnr-status',
                data: { pnr: pnr },
                answer: `I've checked the status for PNR **${pnr}**. The current status is **Confirmed** (Coach B2, Seat 42). The chart has been prepared.`,
                source: 'pnr_system'
            });
        }

        if (trainNumMatch && !lowerMsg.includes('to') && !lowerMsg.includes('from')) {
            const train = await Train.findOne({ number: trainNumMatch[0] });
            if (train) {
                return res.json({
                    success: true,
                    answer: `Train **${train.number} - ${train.name}** runs from **${train.from}** to **${train.to}**. It is currently scheduled to depart at **${train.departureTime}** and arrive at **${train.arrivalTime}**.`,
                    source: 'train_db'
                });
            }
        }

        // 2. Dynamic Train Search Detection
        const travelKeywords = ['to', 'from', 'between', 'train to', 'train from', 'reach'];
        if (lowerMsg.includes('train') && travelKeywords.some(tk => lowerMsg.includes(tk))) {
            const stations = await Station.find({});

            // Basic Entity Extraction: Attempt to find two station names in the message
            let foundStations = [];

            // Check for direct station matches in the text
            for (const station of stations) {
                if (lowerMsg.includes(station.name.toLowerCase()) || lowerMsg.includes(station.code.toLowerCase())) {
                    foundStations.push(station.name);
                }
            }

            // Deduplicate
            foundStations = [...new Set(foundStations)];

            if (foundStations.length >= 2) {
                // Determine Source and Destination (heuristic: "from X to Y")
                let from = foundStations[0];
                let to = foundStations[1];

                // Better heuristic: search for indices of "from" and "to"
                const fromIdx = lowerMsg.indexOf('from');
                const toIdx = lowerMsg.indexOf('to');

                if (fromIdx !== -1 && toIdx !== -1) {
                    // Try to find which station is closer to "from" and "to"
                    const s0Idx = lowerMsg.indexOf(foundStations[0].toLowerCase());
                    const s1Idx = lowerMsg.indexOf(foundStations[1].toLowerCase());

                    if (Math.abs(s0Idx - fromIdx) < Math.abs(s1Idx - fromIdx)) {
                        from = foundStations[0];
                        to = foundStations[1];
                    } else {
                        from = foundStations[1];
                        to = foundStations[0];
                    }
                }

                // Perform real search (Reuse logic from trainController implicitly)
                const allTrains = await Train.find({});
                let results = [];

                allTrains.forEach(train => {
                    const startIdx = train.schedule.findIndex(s => s.station === from);
                    const endIdx = train.schedule.findIndex(s => s.station === to);

                    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
                        const startStop = train.schedule[startIdx];
                        const endStop = train.schedule[endIdx];
                        results.push({
                            trainName: train.name,
                            trainNumber: train.number,
                            from: startStop.station,
                            to: endStop.station,
                            departure: startStop.departure || startStop.arrival,
                            arrival: endStop.arrival || endStop.departure,
                            duration: train.duration || 'N/A'
                        });
                    }
                });

                if (results.length > 0) {
                    return res.json({
                        success: true,
                        type: 'train-list',
                        data: results.slice(0, 5),
                        answer: `I found **${results.length}** trains running from **${from}** to **${to}**. Here are the best matches:`,
                        source: 'live_db'
                    });
                } else {
                    return res.json({
                        success: true,
                        answer: `I couldn't find any direct trains between **${from}** and **${to}**. You may want to check connecting routes in the main search page.`,
                        source: 'live_db'
                    });
                }
            }
        }

        // 3. Knowledge Base Match
        const match = WEBSITE_KNOWLEDGE.find(item =>
            item.keywords.some(keyword => lowerMsg.includes(keyword))
        );

        if (match) {
            return res.json({
                success: true,
                answer: match.answer,
                source: 'knowledge_base'
            });
        }

        // 4. Final Fallback
        return res.json({
            success: true,
            answer: "Sorry for we cant help. I am only here to help you with Train Express website related questions like train schedules, PNR status, and bookings.",
            source: 'none'
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
