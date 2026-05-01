const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/train-express';

// Reuse schemas
const stationSchema = new mongoose.Schema({
    name: String,
    code: String,
    latitude: Number,
    longitude: Number
});
const Station = mongoose.model('Station', stationSchema);

const trainSchema = new mongoose.Schema({
    number: String,
    name: String,
    distance: Number,
    schedule: [{
        station: String,
        code: String,
        distanceFromStart: Number
    }]
});
const Train = mongoose.model('Train', trainSchema);

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const stations = await Station.find();
        const stationMap = new Map();
        stations.forEach(s => {
            stationMap.set(s.name, s);
            if (s.code) stationMap.set(s.code, s);
        });

        const trains = await Train.find();
        console.log(`Processing ${trains.length} trains...`);

        for (const train of trains) {
            if (!train.schedule || train.schedule.length === 0) continue;

            console.log(`Recalculating distances for: ${train.number} - ${train.name}`);
            
            // Source is 0
            train.schedule[0].distanceFromStart = 0;

            for (let i = 1; i < train.schedule.length; i++) {
                const prevStop = train.schedule[i - 1];
                const currentStop = train.schedule[i];

                const prevStation = stationMap.get(prevStop.station) || stationMap.get(prevStop.code);
                const currentStation = stationMap.get(currentStop.station) || stationMap.get(currentStop.code);

                if (prevStation && currentStation && prevStation.latitude && currentStation.latitude) {
                    const distBetween = calculateHaversineDistance(
                        prevStation.latitude, prevStation.longitude,
                        currentStation.latitude, currentStation.longitude
                    );
                    currentStop.distanceFromStart = prevStop.distanceFromStart + distBetween;
                } else {
                    // Fallback: If we can't calculate, we keep legacy or add a small jump
                    if (!currentStop.distanceFromStart || currentStop.distanceFromStart <= prevStop.distanceFromStart) {
                        currentStop.distanceFromStart = prevStop.distanceFromStart + 50;
                    }
                }
            }

            // Update total train distance
            train.distance = train.schedule[train.schedule.length - 1].distanceFromStart;
            
            // Mark modified for subdocuments
            train.markModified('schedule');
            await train.save();
        }

        console.log('Bulk recalculation complete!');
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

start();
