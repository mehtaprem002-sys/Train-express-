const mongoose = require('mongoose');
const Train = require('./models/Train');

mongoose.connect('mongodb://localhost:27017/train-express').then(async () => {
    const trains = await Train.find({ 'overrides.0': { $exists: true } });
    console.log("Trains with overrides:", trains.length);
    if(trains.length > 0) {
        console.log("First train's overrides:");
        console.log(JSON.stringify(trains[0].overrides, null, 2));
    } else {
        console.log("No overrides found in the DB. This means updates are not saving the array.");
    }
    process.exit();
}).catch(console.error);
