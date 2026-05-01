const mongoose = require('mongoose');
const Train = require('./models/Train');

async function checkOverrides() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        const train = await Train.findOne({ number: '12216' });
        
        if (!train) {
            console.log("Train 12216 not found");
            return;
        }

        console.log(`Train: ${train.name} (${train.number})`);
        console.log(`Global Base Price: ${train.basePrice}`);
        console.log(`Overrides Count: ${train.overrides.length}`);
        
        const targetDate = '2026-04-18';
        const override = train.overrides.find(o => {
            const oDate = o.date ? (o.date.includes('T') ? o.date.split('T')[0] : o.date) : '';
            return oDate === targetDate;
        });

        if (override) {
            console.log(`Found Override for ${targetDate}:`);
            console.log(JSON.stringify(override, null, 2));
        } else {
            console.log(`No override found for ${targetDate}`);
            console.log(`Available dates in overrides:`, train.overrides.map(o => o.date));
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkOverrides();
