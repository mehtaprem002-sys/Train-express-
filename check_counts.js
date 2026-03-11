const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Train = mongoose.model('Train', new mongoose.Schema({}));
        const count = await Train.countDocuments();
        console.log('Train Count:', count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
