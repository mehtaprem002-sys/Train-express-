const mongoose = require('mongoose');
const Train = require('./backend/models/Train');

async function checkTrain() {
    try {
        await mongoose.connect('mongodb://localhost:27010/train-express'); // Guessing URI, I'll check first
        const train = await Train.findOne({ number: '12216' });
        console.log(JSON.stringify(train, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
checkTrain();
