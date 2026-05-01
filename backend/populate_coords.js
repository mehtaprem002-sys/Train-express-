const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/train-express';

const stationSchema = new mongoose.Schema({
    name: String,
    code: String,
    city: String,
    latitude: Number,
    longitude: Number
});

const Station = mongoose.model('Station', stationSchema);

function fetchCoords(stationName) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(`${stationName} railway station, India`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        
        const options = {
            headers: {
                'User-Agent': 'TrainExpress/1.0 (Admin Auto-Populate)'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json && json.length > 0) {
                        resolve({ lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const stations = await Station.find({ 
            $or: [
                { latitude: { $exists: false } },
                { longitude: { $exists: false } },
                { latitude: null },
                { longitude: null }
            ]
        });

        console.log(`Found ${stations.length} stations without coordinates.`);

        for (const station of stations) {
            console.log(`Fetching coordinates for: ${station.name}...`);
            const coords = await fetchCoords(station.name);
            
            if (coords) {
                station.latitude = coords.lat;
                station.longitude = coords.lon;
                await station.save();
                console.log(`✅ Updated ${station.name}: ${coords.lat}, ${coords.lon}`);
            } else {
                console.log(`❌ Could not find coordinates for ${station.name}`);
            }
            
            // Sleep for 1.1s to respect Nominatim usage policy (1 request/sec)
            await new Promise(r => setTimeout(r, 1100));
        }

        console.log('All stations processed.');
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

start();
