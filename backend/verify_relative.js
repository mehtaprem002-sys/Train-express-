const mongoose = require('mongoose');
const Train = require('./models/Train');
const trainController = require('./controllers/train.controller');

async function verifyRelativePricing() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        
        // 1. Create a dummy train with ONLY 3A and 2A
        const dummyTrain = new Train({
            name: "Premium Express (No SL)",
            number: "99999",
            classes: ["3A", "2A"],
            basePrice: 2100, // This is now for 3A since SL is missing
            schedule: [
                { station: "SOURCE", departure: "08:00", distanceFromStart: 0 },
                { station: "DEST", arrival: "20:00", distanceFromStart: 1000 }
            ]
        });

        console.log(`--- VERIFYING RELATIVE PRICING ---`);
        console.log(`Train Classes: ${dummyTrain.classes.join(', ')}`);
        console.log(`Global Base Price: ₹${dummyTrain.basePrice}`);

        const req3A = { params: { id: "dummy" }, query: { date: '2026-04-18', classType: '3A', dist: 1000 } };
        const req2A = { params: { id: "dummy" }, query: { date: '2026-04-18', classType: '2A', dist: 1000 } };

        // We'll mock the internal call or just test the logic directly since we have the function
        // However, calculatePrice is not exported, so we hit the simulator logic (which we updated) 
        // with a mock train object.
        
        // Actually, I'll just check the result by manually calling simulateOverride logic if possible, 
        // or just rely on the fact that I'll hit the API after saving this dummy.
        
        await dummyTrain.save();
        console.log(`Dummy train ${dummyTrain.number} saved.`);

        const baseUrl = 'http://localhost:5000/api';
        
        const res3A = await fetch(`${baseUrl}/trains/${dummyTrain._id}/simulate?date=2026-04-18&classType=3A&dist=1000`);
        const data3A = await res3A.json();
        console.log(`Class 3A Price: ₹${data3A.price} (Expected: ₹2100)`);

        const res2A = await fetch(`${baseUrl}/trains/${dummyTrain._id}/simulate?date=2026-04-18&classType=2A&dist=1000`);
        const data2A = await res2A.json();
        console.log(`Class 2A Price: ₹${data2A.price} (Expected: ₹3200)`);

        // Clean up
        await Train.deleteOne({ _id: dummyTrain._id });
        console.log(`Dummy train cleaned up.`);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

verifyRelativePricing();
