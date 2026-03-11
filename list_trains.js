const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('backend_output.json', 'utf8'));
    if (data.allTrains) {
        data.allTrains.forEach(t => {
            console.log(`${t.trainNo || t.number} - ${t.name}: [${t.classes.join(', ')}]`);
        });
    } else {
        console.log('No allTrains property found in JSON');
    }
} catch (e) {
    console.error('Error reading JSON:', e);
}
