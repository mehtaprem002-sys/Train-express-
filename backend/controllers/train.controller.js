const Train = require('../models/Train');
const Availability = require('../models/Availability');
const Station = require('../models/Station');

const getDayName = (dateString) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(dateString);
    return days[d.getDay()];
};

// Helper: Calculate duration between two HH:mm strings
const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutes < 0) minutes += 24 * 60; // Crosses midnight
    const flowHours = Math.floor(minutes / 60);
    const flowMinutes = minutes % 60;
    return `${flowHours}h ${flowMinutes}m`;
};

// COACH CLASS PRICING Multipliers
const ratesPerKm = { '2S': 0.45, 'SL': 0.70, 'CC': 1.50, '3A': 1.80, '2A': 2.50, '1A': 4.00, 'EC': 3.00 };

// Deterministic Availability Generator
const generateAvailability = (trainNo, dateStr, cls) => {
    let hash = 0;
    const combined = `${trainNo}${dateStr}${cls}`;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    const absHash = Math.abs(hash);

    // 1. Determine Capacity Cap based on Class (Realistic Limits)
    const caps = {
        '2S': 300, 'SL': 220, 'CC': 100,
        '3A': 120, '2A': 60, '1A': 24, 'EC': 50
    };
    const maxSeats = caps[cls] || 150;

    // 2. Determine Date Factor (Proximity Logic)
    const travelDate = new Date(dateStr);
    const today = new Date();
    travelDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = travelDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const rand100 = absHash % 100; // 0-99 Deterministic Random

    let status = 'AVL';
    let count = 0;

    // Logic: Closer dates = Higher chance of WL, Lower AVL counts
    if (diffDays <= 2) {
        // Immediate Travel (Today/Tomorrow/DayAfter) -> High Contention
        if (rand100 < 75) { // 75% Waitlist
            status = 'WL';
            count = (absHash % 80) + 1; // WL 1 to 80
        } else {
            status = 'AVL';
            // Very few seats left (1 to 15% of capacity)
            const limit = Math.max(5, Math.floor(maxSeats * 0.15));
            count = (absHash % limit) + 1;
        }
    } else if (diffDays <= 10) {
        // Medium Term (Within ~1.5 weeks) -> medium contention
        if (rand100 < 40) { // 40% Waitlist
            status = 'WL';
            count = (absHash % 60) + 1;
        } else {
            status = 'AVL';
            // 10% to 50% of capacity available
            const limit = Math.floor(maxSeats * 0.5);
            count = (absHash % limit) + 5;
        }
    } else {
        // Future Travel (> 10 days) -> High Availability
        if (rand100 < 10) { // 10% Waitlist (Peak season simulation)
            status = 'WL';
            count = (absHash % 40) + 1;
        } else {
            status = 'AVL';
            // 40% to 95% of capacity available
            const min = Math.floor(maxSeats * 0.4);
            const range = Math.floor(maxSeats * 0.55);
            count = (absHash % range) + min;
        }
    }

    if (count <= 0) count = 1; // Safety

    // UI Properties
    let text, color, bg;
    if (status === 'AVL') {
        text = `AVL ${count}`;
        color = 'text-green-600 dark:text-green-400';
        bg = 'bg-green-100 dark:bg-green-900/30';
    } else if (status === 'WL') {
        text = `WL ${count}`;
        color = 'text-yellow-700 dark:text-yellow-400';
        bg = 'bg-yellow-100 dark:bg-yellow-900/30';
    } else {
        // Fallback
        status = 'REGRET';
        count = 0;
        text = 'REGRET';
        color = 'text-red-600 dark:text-red-400';
        bg = 'bg-red-100 dark:bg-red-900/30';
    }

    return { status, count, text, color, bg };
};

exports.generateAvailability = generateAvailability;

exports.searchTrains = async (req, res) => {
    try {
        const { from, to, date } = req.query;
        console.log(`Advanced Route Search: From=${from} To=${to} Date=${date}`);

        if (!from || !to) return res.json([]);

        const searchDay = date ? getDayName(date) : null;

        // Fetch all trains to build the graph
        // In a production app with thousands of trains, we would query somewhat selectively,
        // but for <100 trains, loading all is fine for graph construction.
        const allTrains = await Train.find({});
        const stations = await Station.find({});

        // Optimisation: Fetch all availability records for this date in one go
        const dbAvailabilities = await Availability.find({ date: date || new Date().toISOString().split('T')[0] });
        const availMap = new Map();
        dbAvailabilities.forEach(doc => {
            // Convert Mongoose Map to Object if needed, or just store doc
            availMap.set(doc.trainNumber, doc);
        });

        // Helper: Normalize Station Name matching
        const normalize = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const getStationName = (query) => {
            const q = normalize(query);
            const match = stations.find(s => normalize(s.name).includes(q) || normalize(s.code) === q);
            return match ? match.name : query; // Return full name if found, else query
        };

        const sourceName = getStationName(from);
        const destName = getStationName(to);

        console.log(`Normalized Search: ${sourceName} -> ${destName}`);

        // Helper: Robust Station Matching
        const findStationIndex = (schedule, query, resolved) => {
            if (!schedule || !Array.isArray(schedule)) return -1;
            const nq = normalize(query);
            const nr = normalize(resolved);

            // 1. Try Exact Match First (Name or Code)
            let idx = schedule.findIndex(s => {
                if (!s || !s.station) return false;
                const ns = normalize(s.station);
                const nc = normalize(s.code || '');
                return ns === nq || ns === nr || nc === nq || nc === nr;
            });

            // 2. Try Substring Match - ONLY if exact match fails
            if (idx === -1) {
                idx = schedule.findIndex(s => {
                    const ns = normalize(s.station);
                    // Match "Mumbai Central" to "Mumbai" but avoid "Pune" to "Mumbai"
                    return (nq.length >= 3 && ns.includes(nq)) ||
                           (nr.length >= 3 && ns.includes(nr));
                });
            }
            return idx;
        };

        // --- GRAPH CONSTRUCTION ---
        // Adjacency List: Map<StationName, Array<Edge>>
        // Edge: { train, depTime, arrTime, duration, classes, price }

        // Helper: Time Utils
        const parseTime = (str) => {
            if (!str) return 0;
            const [h, m] = str.split(':').map(Number);
            return h * 60 + m;
        };

        const formatMinutes = (mins) => {
            const h = Math.floor(mins / 60) % 24;
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const getDurationMins = (start, end) => {
            let s = parseTime(start);
            let e = parseTime(end);
            if (e < s) e += 24 * 60; // Next day (simple assumption for duration within same run)
            return e - s;
        };

        // We need to support multi-leg.
        // Direct Search is Step 1.
        let results = [];

        // --- STEP 1: DIRECT TRAINS ---
        allTrains.forEach(train => {
            if (searchDay && !(train.runsOn || []).includes(searchDay)) return;

            const startIdx = findStationIndex(train.schedule, from, sourceName);
            const endIdx = findStationIndex(train.schedule, to, destName);

            if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx && train.schedule && train.schedule.length > endIdx) {
                // Found Direct
                const leg = createLeg(train, startIdx, endIdx, date, availMap);
                const stopsCount = endIdx - startIdx - 1;
                results.push({
                    journeyType: 'DIRECT',
                    duration: leg.duration, // Fix: Map to 'duration'
                    totalDuration: leg.duration,
                    legs: [leg],
                    price: leg.price,
                    departure: leg.departure,
                    arrival: leg.arrival,
                    // Pass specific fields required by frontend


                    name: train.name,
                    number: train.number,
                    type: train.type,
                    from: leg.from, // Station Name
                    to: leg.to,     // Station Name
                    from_code: train.from_code || leg.from.substring(0, 3).toUpperCase(),
                    to_code: train.to_code || leg.to.substring(0, 3).toUpperCase(),
                    stops: stopsCount > 0 ? `${stopsCount} Stop${stopsCount > 1 ? 's' : ''}` : 'Non-stop',
                    isDirect: true,
                    // Include classes for frontend renderer
                    classes: leg.classes,
                    delay: leg.delay,
                    estimatedDeparture: leg.estimatedDeparture,
                    estimatedArrival: leg.estimatedArrival,
                    liveStatus: leg.liveStatus,
                    schedule: train.toObject().schedule
                });
                console.log(`Direct Train ${train.number} added with ${train.schedule.length} stops.`);
            }
        });

        // --- STEP 2 & 3: INDIRECT ROUTES (BFS) ---
        // Only if direct count is low? Or always to provide options?
        // User said: "If no direct train exists... automatically calculate".
        // But "Fail-safe: ALWAYS return at least ONE logical route".
        // If we have direct routes, we might skip indirect for performance/clarity, 
        // OR we include them if they are comparable.
        // Let's prioritize Direct. If we have > 0 Direct, we return only Direct? 
        // User: "If a direct train exists... ALWAYS show it as the primary result." 
        // Doesn't explicitly forbid showing others, but "No Direct Train Found -> Best Alternative" implies alternatives are for when direct is missing.
        // However, simple implementation: If results.length > 0, return results.

        // Limit to top 50
        results = results.slice(0, 50);

        // --- STEP 2 & 3: INDIRECT ROUTES (BFS) ---
        console.log('Starting Graph Search for alternatives...');

        // Forward Reachability from Source
        const firstLegs = [];
        allTrains.forEach(train => {
            if (searchDay && !(train.runsOn || []).includes(searchDay)) return;
            const startIdx = findStationIndex(train.schedule, from, sourceName);
            if (startIdx !== -1 && train.schedule) {
                for (let i = startIdx + 1; i < train.schedule.length; i++) {
                    firstLegs.push({
                        train,
                        startIdx,
                        endIdx: i,
                        reachStation: train.schedule[i].station,
                        arrTime: train.schedule[i].arrival
                    });
                }
            }
        });

        // Backward Reachability to Dest
        const lastLegs = [];
        allTrains.forEach(train => {
            const endIdx = findStationIndex(train.schedule, to, destName);
            if (endIdx !== -1 && train.schedule) {
                for (let i = 0; i < endIdx; i++) {
                    lastLegs.push({
                        train,
                        startIdx: i,
                        endIdx,
                        boardStation: train.schedule[i].station,
                        depTime: train.schedule[i].departure
                    });
                }
            }
        });

        // Hubs Search
        firstLegs.forEach(leg1 => {
            const potentialLegs = lastLegs.filter(leg2 =>
                leg2.boardStation === leg1.reachStation &&
                leg2.train.number !== leg1.train.number
            );

            potentialLegs.forEach(leg2 => {
                const t1Arr = parseTime(leg1.arrTime);
                const t2Dep = parseTime(leg2.depTime);
                let waitTime = t2Dep - t1Arr;
                if (waitTime < 0) waitTime += 24 * 60;

                if (waitTime >= 60 && waitTime <= 720) {
                    const leg1Obj = createLeg(leg1.train, leg1.startIdx, leg1.endIdx, date, availMap);
                    const leg2Obj = createLeg(leg2.train, leg2.startIdx, leg2.endIdx, date, availMap);

                    const commonClasses = leg1Obj.classes.filter(c1 => {
                        const type1 = c1.type.trim().toUpperCase();
                        return leg2Obj.classes.some(c2 => c2.type.trim().toUpperCase() === type1);
                    }).map(c1 => {
                        const type1 = c1.type.trim().toUpperCase();
                        const c2 = leg2Obj.classes.find(x => x.type.trim().toUpperCase() === type1);
                        const minCount = Math.min(c1.availability.count || 0, c2.availability.count || 0);
                        const isWL = c1.availability.status === 'WL' || c2.availability.status === 'WL';

                        return {
                            type: c1.type,
                            price: (c1.price || 0) + (c2.price || 0),
                            availability: {
                                status: isWL ? 'WL' : 'AVL',
                                count: minCount,
                                text: isWL ? `WL ${minCount}` : `AVL ${minCount}`,
                                color: isWL ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-600 dark:text-green-400',
                                bg: isWL ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'
                            }
                        };
                    });

                    const finalClasses = commonClasses.length > 0 ? commonClasses : leg1Obj.classes;

                    const totalPrice = leg1Obj.price + leg2Obj.price;
                    const totalMins = getDurationMins(leg1Obj.departure, leg1Obj.arrival) + waitTime + getDurationMins(leg2Obj.departure, leg2Obj.arrival);
                    const totalDurStr = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;

                    results.push({
                        journeyType: 'CONNECTING',
                        duration: totalDurStr,
                        totalDuration: totalDurStr,
                        legs: [leg1Obj, leg2Obj],
                        price: totalPrice,
                        departure: leg1Obj.departure,
                        arrival: leg2Obj.arrival,
                        name: leg1.train.name === leg2.train.name ? leg1.train.name : `${leg1.train.name} & ${leg2.train.name}`,
                        number: leg1.train.number === leg2.train.number ? leg1.train.number : `${leg1.train.number} & ${leg2.train.number}`,
                        displayTitle: leg1.train.name === leg2.train.name ? leg1.train.name : `${leg1.train.name} & ${leg2.train.name}`,
                        type: (leg1.train.type || 'Express') === (leg2.train.type || 'Express') ? (leg1.train.type || 'Express') : 'MIXED SERVICES',
                        stops: '1 Change',
                        isDirect: false,
                        via: leg1.reachStation,
                        from: leg1Obj.from,
                        to: leg2Obj.to,
                        from_code: leg1.train.from_code || leg1Obj.from.substring(0, 3).toUpperCase(),
                        to_code: leg2.train.to_code || leg2Obj.to.substring(0, 3).toUpperCase(),
                        waitTime: `${Math.floor(waitTime / 60)}h ${waitTime % 60}m`,
                        delay: leg1Obj.delay,
                        estimatedDeparture: leg1Obj.estimatedDeparture,
                        estimatedArrival: leg2Obj.estimatedArrival,
                        liveStatus: leg1Obj.liveStatus,
                        classes: finalClasses
                    });
                }
            });
        });

        results.sort((a, b) => {
            if (a.isDirect && !b.isDirect) return -1;
            if (!a.isDirect && b.isDirect) return 1;

            const parseDur = (d) => {
                const parts = d.split('h ');
                const h = parseInt(parts[0]) || 0;
                const m = parts[1] ? parseInt(parts[1]) : 0;
                return h * 60 + m;
            };
            return parseDur(a.totalDuration) - parseDur(b.totalDuration);
        });

        res.json(results.slice(0, 50));

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Search failed', details: error.message, stack: error.stack });
    }
};

// Helper to create a standardized Leg object
// Helper: Centralized Price Calculation Logic
const calculatePrice = (train, cls, dist, totalDist, isFullJourney, searchDate) => {
    let dateToUse = searchDate || new Date().toISOString().split('T')[0];
    if (dateToUse.includes('T')) dateToUse = dateToUse.split('T')[0];

    const targetCls = (cls || 'SL').trim().toUpperCase();
    let rawPrice = 0;
    let isOverride = false;

    const RATE_PER_KM = { '2S': 0.45, 'SL': 0.65, 'CC': 1.50, '3A': 1.40, '2A': 2.00, '1A': 3.20, 'EC': 2.80 };
    const BASE_FARE = { '2S': 60, 'SL': 100, 'CC': 250, '3A': 350, '2A': 550, '1A': 900, 'EC': 750 };
    const CLASS_MULTIPLIERS = { '2S': 0.6, 'SL': 1.0, 'CC': 2.2, '3A': 2.1, '2A': 3.2, '1A': 5.5, 'EC': 4.8 };
    const multiplier = CLASS_MULTIPLIERS[targetCls] || 1.0;

    // Relative Multiplier Logic: 
    // Determine the reference class that the 'basePrice' corresponds to.
    let activeClasses = [];
    if (Array.isArray(train.classes)) {
        activeClasses = train.classes.map(c => (c || '').toString().trim().toUpperCase());
    } else if (typeof train.classes === 'string') {
        activeClasses = train.classes.split(',').map(c => c.trim().toUpperCase());
    }
    
    // Selection Priority: SL > 3A > CC > First Available
    let referenceClass = 'SL';
    if (activeClasses.includes('SL')) {
        referenceClass = 'SL';
    } else if (activeClasses.includes('3A')) {
        referenceClass = '3A';
    } else if (activeClasses.includes('CC')) {
        referenceClass = 'CC';
    } else if (activeClasses.length > 0) {
        referenceClass = activeClasses[0];
    }
    
    const refMultiplier = CLASS_MULTIPLIERS[referenceClass] || 1.0;
    const relativeMultiplier = multiplier / refMultiplier;

    if (train.overrides && train.overrides.length > 0) {
        const override = train.overrides.find(o => {
            const oDate = o.date ? (o.date.includes('T') ? o.date.split('T')[0] : o.date) : '';
            const oClass = (o.classType || '').trim().toUpperCase();
            return oDate === dateToUse && oClass === targetCls;
        });

        if (override && override.price != null && override.price > 0) {
            rawPrice = isFullJourney ? override.price : (override.price * dist) / (totalDist || 1);
            isOverride = true;
        }
    }

    if (!isOverride && train.basePrice && train.basePrice > 0) {
        const basePriceNum = Number(train.basePrice);
        const fullPrice = basePriceNum * relativeMultiplier;
        rawPrice = isFullJourney ? fullPrice : (fullPrice * dist) / (totalDist || 1);
        isOverride = true;
    }

    if (!isOverride) {
        let rate = RATE_PER_KM[targetCls] || 0.65;
        let base = BASE_FARE[targetCls] || 100;
        rawPrice = base + (dist * rate);

        let typeMult = 1.0;
        const tt = train.type || '';
        if (tt.includes('Rajdhani') || tt.includes('Duronto') || tt.includes('Vande')) {
            typeMult = (targetCls === '1A' || targetCls === 'EC') ? 1.2 : 1.15;
        } else if (tt.includes('Shatabdi')) {
            typeMult = 1.10;
        } else if (tt === 'Superfast') {
            typeMult = 1.05;
        }
        rawPrice *= typeMult;

        let seed = 0;
        const hashStr = (train.number || '0000') + targetCls;
        for (let i = 0; i < hashStr.length; i++) {
            seed = ((seed << 5) - seed) + hashStr.charCodeAt(i);
            seed |= 0;
        }
        const trainNumInt = parseInt((train.number || '0').replace(/\D/g, '')) || 0;
        rawPrice += ((Math.abs(seed) % 75) - 37) + ((trainNumInt % 17) * 4);
    }

    let finalPrice = Math.floor(rawPrice);
    if (!isOverride) {
        const trainNumInt = parseInt((train.number || '0').replace(/\D/g, '')) || 0;
        const targetLast = (trainNumInt + (targetCls.charCodeAt(0) || 0)) % 10;
        finalPrice += (targetLast - (finalPrice % 10));
    }

    return Math.max(finalPrice, BASE_FARE[targetCls] || 60);
};

// Helper: Standard availability matching
const getMatchAvailability = (train, cls, dateToUse, availMap) => {
    const targetCls = (cls || 'SL').trim().toUpperCase();

    if (availMap && availMap.has(train.number)) {
        const doc = availMap.get(train.number);
        let statusObj = (doc.classes instanceof Map) ? doc.classes.get(targetCls) : (doc.classes || {})[targetCls];
        if (statusObj) return statusObj;
    }

    if (train.overrides && train.overrides.length > 0) {
        const override = train.overrides.find(o => {
            const oDate = o.date ? (o.date.includes('T') ? o.date.split('T')[0] : o.date) : '';
            return oDate === dateToUse && (o.classType || '').trim().toUpperCase() === targetCls;
        });

        if (override) {
            if (override.availableSeats > 0) return { status: 'AVL', count: override.availableSeats, text: `AVL ${override.availableSeats}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
            if (override.waitlistSeats > 0) return { status: 'WL', count: override.waitlistSeats, text: `WL ${override.waitlistSeats}`, color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
            if (override.availableSeats === 0 || override.waitlistSeats === 0) return { status: 'REGRET', count: 0, text: 'REGRET', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
        }
    }

    if (train.availableSeats > 0) return { status: 'AVL', count: train.availableSeats, text: `AVL ${train.availableSeats}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    return exports.generateAvailability(train.number, dateToUse, targetCls);
};

const createLeg = (train, startIdx, endIdx, searchDate, availMap) => {
    const startStop = train.schedule[startIdx];
    const endStop = train.schedule[endIdx];
    const dist = Math.abs(endStop.distanceFromStart - startStop.distanceFromStart);
    const dateToUse = searchDate || new Date().toISOString().split('T')[0];
    const totalSchedule = train.schedule || [];
    const totalDist = (totalSchedule.length > 0) ? (totalSchedule[totalSchedule.length - 1].distanceFromStart || 1) : 1;
    const isFullJourney = (startIdx === 0 && endIdx === totalSchedule.length - 1);

    const price = calculatePrice(train, 'SL', dist, totalDist, isFullJourney, dateToUse);



    // Apply Check for overrides (Train No and Times)
    let trainNumberToUse = train.number;
    let depTimeToUse = startStop.departure || startStop.arrival || '00:00';
    let arrTimeToUse = endStop.arrival || endStop.departure || '00:00';

    // --- LIVE STATUS SIMULATION ---
    const now = new Date();
    const seed = parseInt(train.number || '0') + now.getDate();
    const delay = seed % 15; // Simulated 0-15 mins delay

    const addMinutes = (timeStr, mins) => {
        if (!timeStr || timeStr === 'N/A') return 'N/A';
        const [h, m] = timeStr.split(':').map(Number);
        const totalMins = (h * 60 + m + mins) % 1440;
        const newH = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const newM = (totalMins % 60).toString().padStart(2, '0');
        return `${newH}:${newM}`;
    };

    if (train.overrides && train.overrides.length > 0) {
        // Find if ANY override for this date has train-wide settings
        const trainWideOverride = train.overrides.find(o => {
            const oDate = o.date ? (o.date.includes('T') ? o.date.split('T')[0] : o.date) : '';
            return oDate === dateToUse && (o.trainNo || o.departureTime || o.arrivalTime);
        });
        if (trainWideOverride) {
            if (trainWideOverride.trainNo) trainNumberToUse = trainWideOverride.trainNo;
            if (trainWideOverride.departureTime && startIdx === 0) depTimeToUse = trainWideOverride.departureTime;
            if (trainWideOverride.arrivalTime && endIdx === train.schedule.length - 1) arrTimeToUse = trainWideOverride.arrivalTime;
        }
    }

    // Recalculate duration if times changed
    let mins = 0;
    const [h1, m1] = depTimeToUse.split(':').map(Number);
    const [h2, m2] = arrTimeToUse.split(':').map(Number);
    mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60;
    const durStr = `${Math.floor(mins / 60)}h ${mins % 60}m`;

    return {
        trainName: train.name,
        trainNumber: trainNumberToUse,
        from: startStop.station,
        to: endStop.station,
        departure: depTimeToUse,
        arrival: arrTimeToUse,
        duration: durStr,
        distance: dist,
        price: price,
        delay: delay,
        estimatedDeparture: addMinutes(depTimeToUse, delay),
        estimatedArrival: addMinutes(arrTimeToUse, delay),
        liveStatus: delay > 0 ? `Running late by ${delay} mins` : 'On Time',
        classes: (train.classes || []).map(c => ({
            type: c,
            price: calculatePrice(train, c, dist, totalDist, isFullJourney, dateToUse),
            availability: getMatchAvailability(train, c, dateToUse, availMap)
        })) // Populate classes with REAL availability or fallback
    };
};

exports.simulateOverride = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, classType, tempBasePrice, tempClasses } = req.query;
        if (!id || !date || !classType) return res.status(400).json({ error: 'Missing parameters' });

        const train = await Train.findById(id);
        if (!train) return res.status(404).json({ error: 'Train not found' });

        // Apply temporary overrides for simulation preview if provided
        if (tempBasePrice) {
            train.basePrice = Number(tempBasePrice);
        }
        if (tempClasses) {
            // Note: Mongoose might treat this as a string or array depending on how it's used next.
            // We split it to ensure calculatePrice sees it as an array of classes.
            train.classes = tempClasses.split(',').map(c => c.trim());
        }

        let dist = 500;
        if (train.schedule && train.schedule.length >= 2) {
            const startStop = train.schedule[0];
            const endStop = train.schedule[train.schedule.length - 1];
            dist = Math.abs(endStop.distanceFromStart - startStop.distanceFromStart);
        }

        const RATE_PER_KM = { '2S': 0.45, 'SL': 0.65, 'CC': 1.50, '3A': 1.40, '2A': 2.00, '1A': 3.20, 'EC': 2.80 };
        const BASE_FARE = { '2S': 60, 'SL': 100, 'CC': 250, '3A': 350, '2A': 550, '1A': 900, 'EC': 750 };

        // Unified Price and Availability check
        const totalSchedule = train.schedule || [];
        const totalDist = (totalSchedule.length > 0) ? (totalSchedule[totalSchedule.length - 1].distanceFromStart || 1) : 1;
        
        const generatedAvailability = getMatchAvailability(train, classType, date, null);
        const generatedPrice = calculatePrice(train, classType, dist, totalDist, true, date); // Admin simulation assumes full distance for the context they are viewing

        res.json({
            availability: generatedAvailability,
            price: generatedPrice,

            trainNumber: train.number,
            departureTime: (train.schedule && train.schedule.length > 0 && train.schedule[0].departure) ? train.schedule[0].departure : (train.departureTime || '08:00'),
            arrivalTime: (train.schedule && train.schedule.length > 0 && train.schedule[train.schedule.length - 1].arrival) ? train.schedule[train.schedule.length - 1].arrival : (train.arrivalTime || '20:00')
        });
    } catch (e) {
        console.error('simulateOverride error:', e);
        res.status(500).json({ error: 'Simulation failed' });
    }
};

exports.getAllTrains = async (req, res) => {
    try {
        const trains = await Train.find({});
        console.log(`getAllTrains called. Found ${trains.length} trains.`);
        
        const today = new Date().toISOString().split('T')[0];

        const result = trains.map(t => {
            const trainObj = t.toObject();
            if (trainObj.availableSeats == null && trainObj.waitlistSeats == null) {
                // Show dynamic availability based on today so it is not blank
                const defaultClass = (trainObj.classes && trainObj.classes.length > 0) ? trainObj.classes[0] : 'SL';
                const avail = exports.generateAvailability(trainObj.number, today, defaultClass);
                if (avail.status === 'AVL') {
                    trainObj.availableSeats = avail.count;
                } else if (avail.status === 'WL') {
                    trainObj.waitlistSeats = avail.count;
                }
            }
            return { id: t._id, ...trainObj };
        });

        res.json(result);
    } catch (error) {
        console.error('getAllTrains error:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

exports.createTrain = async (req, res) => {
    try {
        const newTrain = await Train.create(req.body);
        res.status(201).json({ id: newTrain._id, ...newTrain.toObject() });
    } catch (error) {
        console.error('API Error in createTrain:', error);
        res.status(500).json({ error: error.message || 'Failed to create train' });
    }
};

exports.updateTrain = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[updateTrain] Request for ID: ${id}. Overrides:`, req.body.overrides?.length);
        
        // 1. Fetch the existing train
        const train = await Train.findById(id);
        if (!train) return res.status(404).json({ error: 'Train not found' });

        const oldOverrides = [...(train.overrides || [])];
        const oldAvailable = train.availableSeats;
        const oldWaitlist = train.waitlistSeats;

        const newOverrides = req.body.overrides || [];

        // 2. Update train properties
        Object.assign(train, req.body);
        
        // Explicitly set overrides to handle deletions correctly in Mongoose
        train.overrides = newOverrides;
        
        // 3. Save the train
        const updated = await train.save();

        // 4. Sync Overrides to Live Availability
        // a) Handle New/Updated Overrides
        for (let override of newOverrides) {
            const oldMatch = oldOverrides.find(o => o.date === override.date && o.classType === override.classType);
            const isChanged = !oldMatch || oldMatch.availableSeats !== override.availableSeats || oldMatch.waitlistSeats !== override.waitlistSeats || oldMatch.price !== override.price;

            if (isChanged) {
                await syncOverrideToAvailability(updated.number, override);
            }
        }

        // b) Handle Deleted Overrides
        const deletedOverrides = oldOverrides.filter(old => 
            !newOverrides.some(nw => nw.date === old.date && nw.classType === old.classType)
        );

        for (let deleted of deletedOverrides) {
            await removeOverrideFromAvailability(updated.number, deleted);
        }

        // c) NEW: If Global Baseline changed, we might need to notify or refresh live data
        // For now, we rely on the search logic falling back to global if no override exists.
        // We've already ensured removals from Availability happen above.


        res.json({ id: updated._id, ...updated.toObject() });
    } catch (error) {
        console.error('updateTrain error:', error);
        res.status(500).json({ error: error.message || 'Failed' });
    }
};

// Helper to sync specific override to Availability collection
async function syncOverrideToAvailability(trainNumber, override) {
    try {
        let status = 'REGRET', count = 0, text = 'REGRET', color = 'text-red-600 dark:text-red-400', bg = 'bg-red-100 dark:bg-red-900/30';
        
        if (override.availableSeats > 0) {
            status = 'AVL'; count = override.availableSeats; text = `AVL ${count}`; color = 'text-green-600 dark:text-green-400'; bg = 'bg-green-100 dark:bg-green-900/30';
        } else if (override.waitlistSeats > 0) {
            status = 'WL'; count = override.waitlistSeats; text = `WL ${count}`; color = 'text-yellow-700 dark:text-yellow-400'; bg = 'bg-yellow-100 dark:bg-yellow-900/30';
        }

        let availDoc = await Availability.findOne({ trainNumber, date: override.date });
        if (!availDoc) {
            availDoc = new Availability({ trainNumber, date: override.date, classes: {} });
        }

        if (availDoc.classes instanceof Map) {
            availDoc.classes.set(override.classType, { status, count, text, color, bg });
        } else {
            availDoc.classes = availDoc.classes || {};
            availDoc.classes[override.classType] = { status, count, text, color, bg };
            availDoc.markModified('classes');
        }

        await availDoc.save();
        console.log(`Synced override to Availability for ${trainNumber} on ${override.date}`);
    } catch (e) {
        console.error('Sync override error:', e);
    }
}

// Helper to remove specific override from Availability collection
async function removeOverrideFromAvailability(trainNumber, deleted) {
    try {
        let availDoc = await Availability.findOne({ trainNumber, date: deleted.date });
        if (availDoc) {
            if (availDoc.classes instanceof Map) {
                availDoc.classes.delete(deleted.classType);
            } else if (availDoc.classes) {
                delete availDoc.classes[deleted.classType];
                availDoc.markModified('classes');
            }

            // If no classes left, we can delete the doc, otherwise save
            const classCount = availDoc.classes instanceof Map ? availDoc.classes.size : Object.keys(availDoc.classes || {}).length;
            if (classCount === 0) {
                await Availability.findByIdAndDelete(availDoc._id);
                console.log(`Deleted empty Availability doc for ${trainNumber} on ${deleted.date}`);
            } else {
                await availDoc.save();
                console.log(`Removed class ${deleted.classType} from Availability for ${trainNumber} on ${deleted.date}`);
            }
        }
    } catch (e) {
        console.error('Remove override error:', e);
    }
}

exports.deleteTrain = async (req, res) => {
    try {
        await Train.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

exports.getStations = async (req, res) => {
    try {
        const stations = await Station.find().sort({ name: 1 });
        res.json(stations.map(s => s.name));
    } catch (error) {
        res.status(500).json([]);
    }
};

exports.getAdminStations = async (req, res) => {
    try {
        const stations = await Station.find().sort({ name: 1 });
        res.json(stations);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

exports.createStation = async (req, res) => {
    try {
        const newStation = await Station.create(req.body);
        res.status(201).json(newStation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create station' });
    }
};

exports.updateStation = async (req, res) => {
    try {
        const updated = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update station' });
    }
};

exports.deleteStation = async (req, res) => {
    try {
        await Station.findByIdAndDelete(req.params.id);
        res.json({ message: 'Station Deleted', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

exports.getLiveStatus = async (req, res) => {
    try {
        const { trainNumber } = req.params;
        console.log(`Live Status Request for Train: ${trainNumber}`);

        const train = await Train.findOne({
            $or: [
                { number: trainNumber },
                { trainNo: trainNumber }
            ]
        });

        if (!train) {
            console.log(`Train ${trainNumber} not found in DB`);
            return res.status(404).json({ error: 'Train not found' });
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentMins = now.getHours() * 60 + now.getMinutes();

        // Defensive check for schedule
        if (!train.schedule || train.schedule.length === 0) {
            console.log(`Train ${trainNumber} has no schedule data`);
            return res.json({
                trainNumber: train.number || train.trainNo,
                trainName: train.name,
                currentStation: 'Terminal',
                nextStation: 'N/A',
                status: 'Schedule not available',
                delay: 0,
                lastUpdated: currentTime,
                departureFromCurrent: 'N/A',
                arrivalAtNext: 'N/A'
            });
        }

        // Ensure schedule is sorted by distance or time (Source to Destination)
        const sortedSchedule = [...train.schedule].sort((a, b) => {
            const distA = a.distanceFromStart || 0;
            const distB = b.distanceFromStart || 0;
            if (distA !== distB) return distA - distB;

            // Fallback to time if distances are same/missing
            const timeA = a.arrival || a.departure || '00:00';
            const timeB = b.arrival || b.departure || '00:00';
            return timeA.localeCompare(timeB);
        });


        // Find current/next station
        let currentStation = sortedSchedule[0];
        let currentStationIndex = 0;
        let nextStation = sortedSchedule.length > 1 ? sortedSchedule[1] : null;
        let status = 'Running on time';
        let delay = 0;

        let isEnRoute = false;

        for (let i = 0; i < sortedSchedule.length - 1; i++) {
            const stop = sortedSchedule[i];
            const nextStop = sortedSchedule[i + 1];

            const arrMins = stop.arrival ? (parseInt(stop.arrival.split(':')[0]) * 60 + parseInt(stop.arrival.split(':')[1])) : 0;
            const depMins = stop.departure ? (parseInt(stop.departure.split(':')[0]) * 60 + parseInt(stop.departure.split(':')[1])) : 0;
            const nextArrMins = nextStop.arrival ? (parseInt(nextStop.arrival.split(':')[0]) * 60 + parseInt(nextStop.arrival.split(':')[1])) : 0;

            // IS AT STATION (Halted)
            if (currentMins >= arrMins && currentMins < depMins) {
                currentStation = stop;
                currentStationIndex = i;
                nextStation = nextStop;
                isEnRoute = false;
                status = `Halted at ${stop.station}`;
                break;
            }

            // IS EN ROUTE (Between stations)
            if (currentMins >= depMins && currentMins < nextArrMins) {
                currentStation = stop;
                currentStationIndex = i;
                nextStation = nextStop;
                isEnRoute = true;
                status = `Departed from ${stop.station}`;
                break;
            }

            if (i === sortedSchedule.length - 2 && currentMins >= nextArrMins) {
                currentStation = nextStop;
                currentStationIndex = i + 1;
                nextStation = null;
                isEnRoute = false;
                status = `Reached ${nextStop.station}`;
            }
        }


        // Probabilistic Delay Simulation: Only ~30% of trains have moderate delays
        // Others are either on time or have very minor (1-2 min) jitter
        const seed = parseInt(train.number || '0') + now.getDate();
        const probabilitySeed = seed % 10;

        if (probabilitySeed < 3) {
            // 30% chance of significant delay (5-20 mins)
            delay = 5 + (seed % 16);
        } else if (probabilitySeed < 6) {
            // 30% chance of minor jitter (1-3 mins)
            delay = 1 + (seed % 3);
        } else {
            // 40% chance of being perfectly on time
            delay = 0;
        }

        if (delay > 0) {
            status = `Running late by ${delay} mins (${status})`;
        } else {
            status = `${status} (On Time)`;
        }




        // Map schedule with live info
        const enrichedSchedule = sortedSchedule.map((stop, index) => {
            let stopStatus = 'upcoming';
            if (index < currentStationIndex) {
                stopStatus = 'passed';
            } else if (index === currentStationIndex) {
                stopStatus = 'current';
            }

            // Estimate times based on delay
            const addMinutes = (timeStr, mins) => {
                if (!timeStr || timeStr === 'N/A') return 'N/A';
                const [h, m] = timeStr.split(':').map(Number);
                const totalMins = (h * 60 + m + mins) % 1440;
                const newH = Math.floor(totalMins / 60).toString().padStart(2, '0');
                const newM = (totalMins % 60).toString().padStart(2, '0');
                return `${newH}:${newM}`;
            };

            const stopObj = stop.toObject ? stop.toObject() : stop;
            return {
                ...stopObj,
                status: stopStatus,
                isEnRoute: (index === currentStationIndex) ? isEnRoute : false,
                estimatedArrival: addMinutes(stop.arrival, delay),

                estimatedDeparture: addMinutes(stop.departure, delay)
            };

        });

        const responseData = {
            trainNumber: train.number || train.trainNo,
            trainName: train.name,
            currentStation: currentStation.station,
            nextStation: nextStation ? nextStation.station : 'Destination Reached',
            status: status,
            delay: delay,
            lastUpdated: currentTime,
            departureFromCurrent: currentStation.departure || 'N/A',
            arrivalAtNext: nextStation ? nextStation.arrival : 'N/A',
            fullSchedule: enrichedSchedule
        };

        console.log(`Sending Enriched Live Status for Train ${trainNumber}: ${responseData.trainName}. Schedule Length: ${responseData.fullSchedule.length}`);
        res.json(responseData);




    } catch (error) {
        console.error('Live Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch live status' });
    }
};


