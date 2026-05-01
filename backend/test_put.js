const http = require('http');

const payload = {
    name: "Avantika Express",
    number: "12962",
    type: "Superfast",
    runsOn: ["Mon","Tue"],
    classes: ["SL", "3A"],
    schedule: [
        { station: "Indore Junction", departure: "17:00", arrival: "17:00", distanceFromStart: 0 },
        { station: "Mumbai Central", departure: "00:00", arrival: "00:00", distanceFromStart: 800 }
    ],
    overrides: [{
        date: "2026-04-18",
        classType: "3A",
        availableSeats: 50,
        waitlistSeats: null,
        price: 999
    }]
};

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/trains/6995c752780156b8fcc62140', // Using ID from earlier
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        // Mock token logic - backend looks for token but maybe we bypass or get auth?
        // Wait, the backend requires admin auth.
    }
}, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log("Response:", body));
});

req.write(JSON.stringify(payload));
req.end();
