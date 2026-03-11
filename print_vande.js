const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('backend_output.json', 'utf8'));
    if (data.allTrains) {
        const vb = data.allTrains.find(t => t.name.includes('Vande') || t.type.includes('Vande'));
        if (vb) {
            console.log(JSON.stringify(vb, null, 2));
        } else {
            console.log('Vande Bharat NOT found in parsed JSON');
        }
    }
} catch (e) {
    console.error(e);
}
