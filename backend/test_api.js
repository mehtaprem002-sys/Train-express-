const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@trainexpress.com';
const NEW_PASSWORD = 'admin123';

async function test() {
    try {
        console.log('Resetting admin password...');
        await mongoose.connect('mongodb://localhost:27017/train-express');
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
        await User.findOneAndUpdate({ email: EMAIL }, { password: hashedPassword });
        console.log('Password reset to:', NEW_PASSWORD);

        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: NEW_PASSWORD })
        });

        if (!loginRes.ok) {
            const errData = await loginRes.json();
            throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(errData)}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log('Fetching stats...');
        const endpoints = [
            '/trains/admin/all',
            '/auth/users',
            '/trains/admin/stations',
            '/bookings/all'
        ];

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
                const data = await res.json();
                if (res.ok) {
                    console.log(`[PASS] ${endpoint}: ${Array.isArray(data) ? data.length + ' items' : 'Object returned'}`);
                } else {
                    console.log(`[FAIL] ${endpoint}: ${res.status} ${JSON.stringify(data)}`);
                }
            } catch (err) {
                console.log(`[ERROR] ${endpoint}: ${err.message}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err.message);
        process.exit(1);
    }
}

test();
