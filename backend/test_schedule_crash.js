const mongoose = require('mongoose');
const Train = require('./models/Train');
const http = require('http');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/train-express');
    
    // Create a train with schedule missing departure/arrival
    const badTrain = await Train.create({
        name: "Schedule Crash Train",
        number: "818181",
        from: "Indore",
        to: "Mumbai",
        runsOn: ["Sat"],
        schedule: [
            { station: "Indore", distanceFromStart: 0 }, // NO TIME!
            { station: "Mumbai", distanceFromStart: 500 }
        ]
    });
    console.log("Created crash-test train:", badTrain._id);

    // Trigger search
    http.get('http://localhost:5000/api/trains/search?from=Indore&to=Mumbai&date=2026-04-18', res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', async () => {
            console.log("Search Result status:", res.statusCode);
            console.log("Raw Response:", body);
            
            // Cleanup
            await Train.findByIdAndDelete(badTrain._id);
            console.log("Cleaned up crash-test train.");
            process.exit();
        });
    });
}
run().catch(console.error);
