const mongoose = require('mongoose');
const Train = require('./models/Train');

async function inspectClasses() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        const train = await Train.findOne({ number: '12951' });
        console.log(`Train: ${train.name}`);
        console.log(`Classes Type: ${typeof train.classes}`);
        console.log(`Is Array: ${Array.isArray(train.classes)}`);
        console.log(`Raw Classes:`, JSON.stringify(train.classes));
        
        const activeClasses = (train.classes || []).map(c => {
            console.log(`  Inspecting class: "${c}" (type: ${typeof c})`);
            return c.trim().toUpperCase();
        });
        console.log(`Active Classes:`, JSON.stringify(activeClasses));
        console.log(`Includes 3A: ${activeClasses.includes('3A')}`);
        
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

inspectClasses();
