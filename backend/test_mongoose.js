const mongoose = require('mongoose');
const Train = require('./models/Train');

mongoose.connect('mongodb://localhost:27017/train-express').then(async () => {
    let train = await Train.findOne();
    if(!train) {
        console.log("No trains found"); return process.exit();
    }
    
    console.log("Train found:", train._id);
    const overrides = [{
        date: "2026-04-18",
        classType: "3A",
        availableSeats: 15,
        waitlistSeats: null,
        price: 450
    }];
    
    console.log("Updating via findByIdAndUpdate...");
    const updated = await Train.findByIdAndUpdate(train._id, { overrides: overrides }, { new: true });
    console.log("Updated overrides length:", updated.overrides.length);
    console.log("Updated overrides:", updated.overrides);
    
    // Now verify in DB explicitly
    const verified = await Train.findById(train._id);
    console.log("Verified in DB:", verified.overrides.length);
    process.exit();
}).catch(console.error);
