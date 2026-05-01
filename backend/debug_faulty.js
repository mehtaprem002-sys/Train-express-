const mongoose = require('mongoose');
const Train = require('./models/Train');

// Copied from train.controller.js exactly
const CLASS_MULTIPLIERS = { '2S': 0.6, 'SL': 1.0, 'CC': 2.2, '3A': 2.1, '2A': 3.2, '1A': 5.5, 'EC': 4.8 };
const RATE_PER_KM = { '2S': 0.45, 'SL': 0.65, 'CC': 1.50, '3A': 1.40, '2A': 2.00, '1A': 3.20, 'EC': 2.80 };
const BASE_FARE = { '2S': 60, 'SL': 100, 'CC': 250, '3A': 350, '2A': 550, '1A': 900, 'EC': 750 };

function debugCalculatePrice(train, targetCls, dist, totalDist, isFullJourney, dateToUse) {
    const cls = targetCls || 'SL';
    console.log(`--- DEBUG CALC: ${train.name} (${train.number}) ---`);
    console.log(`Target: ${cls}, Dist: ${dist}, Total: ${totalDist}, Full: ${isFullJourney}`);
    console.log(`Classes in DB: ${JSON.stringify(train.classes)}`);
    console.log(`Base Price in DB: ${train.basePrice}`);

    const multiplier = CLASS_MULTIPLIERS[cls] || 1.0;
    const activeClasses = (train.classes || []).map((c) => c.trim().toUpperCase());
    const referenceClass = activeClasses.includes('SL') ? 'SL' : (activeClasses.includes('3A') ? '3A' : 'SL');
    const refMultiplier = CLASS_MULTIPLIERS[referenceClass] || 1.0;
    const relativeMultiplier = multiplier / refMultiplier;
    
    console.log(`Ref Class: ${referenceClass}, Ref Mult: ${refMultiplier}, Rel Mult: ${relativeMultiplier}`);

    let rawPrice = 0;
    let isOverride = false;

    // Simulate overrides
    // (Assuming no overrides for this test)

    if (!isOverride && train.basePrice && train.basePrice > 0) {
        const fullPrice = train.basePrice * relativeMultiplier;
        console.log(`Base Price Hit! Full Price (SL/Ref equivalent): ${fullPrice}`);
        rawPrice = isFullJourney ? fullPrice : (fullPrice * dist) / (totalDist || 1);
        isOverride = true;
    }

    if (!isOverride) {
        console.log(`FALLBACK TO FORMULA!`);
        let rate = RATE_PER_KM[cls] || 0.65;
        let base = BASE_FARE[cls] || 100;
        rawPrice = base + (dist * rate);
        // ... omitted type mult and jitter for simplicity here or add them
    }

    console.log(`Final Raw: ${rawPrice}, Rounding...`);
    return Math.floor(rawPrice);
}

async function debugFailingTrain() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        
        // Find a train that only has 3A or has 900 base price
        const faultyTrain = await Train.findOne({ basePrice: 900 });
        if (faultyTrain) {
            const price = debugCalculatePrice(faultyTrain, '3A', 1367, 1367, true, '2026-04-18');
            console.log(`Final Calc: ₹${price}`);
        } else {
            console.log("No train found with basePrice 900. Checking all trains with high base price...");
            const trains = await Train.find({ basePrice: { $gt: 800 } });
            trains.forEach(t => {
                debugCalculatePrice(t, '3A', 1367, 1367, true, '2026-04-18');
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

debugFailingTrain();
