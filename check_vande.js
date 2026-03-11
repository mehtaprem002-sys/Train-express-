const fs = require('fs');
try {
    const data = fs.readFileSync('backend_output.json', 'utf8');
    if (data.includes('Vande')) {
        console.log('Found "Vande" in file!');
    } else {
        console.log('Did NOT find "Vande" in file.');
    }
} catch (e) {
    console.error(e);
}
