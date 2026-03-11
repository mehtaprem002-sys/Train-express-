const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('backend_output.json', 'utf8'));
    if (data.search) {
        const vb = data.search.find(t => t.name.includes('Vande') || t.type.includes('Vande'));
        if (vb) {
            console.log(`Train: ${vb.name} (${vb.number})`);
            console.log('Classes:', JSON.stringify(vb.classes, null, 2));
            vb.classes.forEach(c => {
                console.log(`${c.type}: ₹${c.price}`);
            });
        } else {
            console.log('Vande Bharat NOT found in search results');
        }
    } else {
        console.log('No search results found');
    }
} catch (e) {
    console.error(e);
}
