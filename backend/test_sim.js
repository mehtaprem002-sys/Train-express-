const mongoose = require('mongoose');
const trainController = require('./controllers/train.controller');
const Train = require('./models/Train');

async function testSimulation() {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        const train = await Train.findOne({ number: '12216' });

        if (!train) {
            console.log("Train not found");
            return;
        }

        const req = {
            params: { id: train._id },
            query: { date: '2026-04-18', classType: '1A' }
        };

        const res = {
            status: function(s) { this.statusCode = s; return this; },
            json: function(data) {
                console.log(`Simulation Result:`, JSON.stringify(data, null, 2));
            }
        };

        console.log(`--- TESTING ADMIN SIMULATION LOCALLY ---`);
        await trainController.simulateOverride(req, res);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

testSimulation();
