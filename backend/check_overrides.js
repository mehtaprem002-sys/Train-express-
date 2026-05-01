const mongoose = require('mongoose');
const Train = require('./models/Train');

mongoose.connect('mongodb://127.0.0.1:27017/trainDB').then(async () => {
    const trains = await Train.find({ 'overrides.0': { $exists: true } });
    console.log("Trains with overrides:", trains.length);
    if(trains.length > 0) {
        console.log(JSON.stringify(trains[0].overrides, null, 2));
    }
    process.exit();
}).catch(console.error);
