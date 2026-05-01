const mongoose = require('mongoose');
const Train = require('./models/Train');
const http = require('http');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/train-express');
    
    // 1. Create a bad train
    const badTrain = await Train.create({
        name: "Bad Train",
        number: "99999",
        // Notice we omit from, to, type, schedule, runsOn, classes, etc.
    });
    console.log("Created bad train:", badTrain._id);

    // 2. Trigger search
    http.get('http://localhost:5000/api/trains/search?from=Indore&to=Mumbai&date=2026-04-18', res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', async () => {
            console.log("Search Result status:", res.statusCode);
            if(res.statusCode === 500) {
                console.log("Search response:", body);
                // The backend logged the stack trace to its console, but we might not see it.
                // Let's at least see if it 500s.
            }
            
            // 3. Cleanup
            await Train.findByIdAndDelete(badTrain._id);
            console.log("Cleaned up bad train.");
            process.exit();
        });
    });
}
run().catch(console.error);
