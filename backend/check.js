require('dotenv').config();
require('./config/db')();
const Train = require('./models/Train');

Promise.all([
    Train.countDocuments({ classes: { $exists: false } }),
    Train.countDocuments({ schedule: { $exists: false } }),
    Train.countDocuments({ classes: null }),
    Train.countDocuments({ schedule: null }),
    Train.countDocuments({ classes: { $size: 0 } }),
    Train.countDocuments({ schedule: { $size: 0 } })
]).then(counts => {
    console.log('Missing/Empty Classes vs Schedule:', counts);
    process.exit(0);
});
