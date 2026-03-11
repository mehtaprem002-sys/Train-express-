const mongoose = require('mongoose');
const Train = require('./models/Train');

const check = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/train-express');
        const trains = await Train.find({});
        console.log(`Total Trains: ${trains.length}`);
        const trainsWithNoClasses = trains.filter(t => !t.classes || t.classes.length === 0);
        console.log(`Trains with no classes: ${trainsWithNoClasses.length}`);
        if (trainsWithNoClasses.length > 0) {
            console.log('Sample trains with no classes:');
            trainsWithNoClasses.slice(0, 5).forEach(t => console.log(`- ${t.number}: ${t.name}`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
};
check();
