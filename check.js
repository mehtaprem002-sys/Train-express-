const mongoose = require('mongoose');
const Train = require('./backend/models/Train');

mongoose.connect('mongodb://127.0.0.1:27017/train-booking')
  .then(async () => {
    const train = await Train.findOne({ overrides: { $exists: true, $not: {$size: 0} } });
    console.log(train ? train.overrides : 'No trains with overrides found');
    process.exit(0);
  });
