const mongoose = require('mongoose');
const Train = require('./models/Train');
const trainController = require('./controllers/train.controller');

// We need to mock some stuff because trainController.js might use exports/module.exports differently
// But I can actually test the logic if I copy the calculatePrice function here for a quick check
// Or better, just hit the API now that I've applied the fix.

// Wait, I'll use the 'search' API since it's unauthenticated.
async function verifyUnification() {
    const baseUrl = 'http://localhost:5000/api';
    const date = '2026-04-18';

    try {
        console.log(`Checking User Search Price (Unidentified Date)...`);
        const res = await fetch(`${baseUrl}/trains/search?from=SURAT&to=NEW DELHI&date=${date}`);
        const data = await res.json();
        const train = data.find(t => t.number === '12216');
        
        if (train) {
            console.log(`Train: ${train.name}`);
            train.classes.forEach(c => {
                console.log(`Class: ${c.type}, Price: ₹${c.price}`);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

verifyUnification();
