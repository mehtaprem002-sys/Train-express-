const mongoose = require('mongoose');
const Train = require('./models/Train');

async function checkNoSLTrains() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        const trains = await Train.find({ classes: { $ne: "SL" } });
        console.log(`Found ${trains.length} trains without SL.`);
        trains.forEach(t => {
            console.log(`Train: ${t.name} (${t.number}), Classes: ${t.classes}, BasePrice: ${t.basePrice}`);
            // Logic check
            const activeClasses = (t.classes || []).map(c => c.trim().toUpperCase());
            const referenceClass = activeClasses.includes('SL') ? 'SL' : (activeClasses.includes('3A') ? '3A' : 'SL');
            console.log(`Reference Class: ${referenceClass}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkNoSLTrains();
