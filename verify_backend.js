const http = require('http');

function fetchData(path) {
    return new Promise((resolve, reject) => {
        http.get({
            hostname: 'localhost',
            port: 5000,
            path: '/api/trains' + path,
            agent: false
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({ path, status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ path, status: res.statusCode, data: data });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function verify() {
    console.log('Verifying Backend API...');

    try {
        const stations = await fetchData('/stations');
        console.log('\n/stations:', stations.status);
        console.log('Data:', JSON.stringify(stations.data, null, 2).substring(0, 500) + '...');

        const allTrains = await fetchData('/admin/all');
        console.log('\n/admin/all:', allTrains.status);
        if (allTrains.data && allTrains.data.length > 0) {
            const vandeBharat = allTrains.data.find(t => t.name.includes('Vande') || t.type.includes('Vande'));
            if (vandeBharat) {
                console.log('Vande Bharat Name:', vandeBharat.name);
                console.log('Vande Bharat ID:', vandeBharat._id);
                console.log('Vande Bharat Classes:', JSON.stringify(vandeBharat.classes));
                console.log('Vande Bharat Base Price:', vandeBharat.basePrice);
                console.log('Vande Bharat Type:', vandeBharat.type);
            } else {
                console.log('No Vande Bharat train found in DB');
            }
        } else {
            console.log('No trains found.');
        }

        // Test search for a route with multiple trains to verify pricing uniqueness
        const from = "Mumbai Central";
        const to = "Vadodara Junction";
        const date = new Date();
        date.setDate(date.getDate() + 1); // Tomorrow
        const dateStr = date.toISOString().split('T')[0];

        console.log(`\nTesting search: ${from} -> ${to} on ${dateStr}`);
        const searchPath = `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${dateStr}`;
        const search = await fetchData(searchPath);
        console.log(`/search status:`, search.status);
        console.log('Results:', JSON.stringify(search.data, null, 2));

        const fs = require('fs');
        fs.writeFileSync('backend_output.json', JSON.stringify({ stations: stations.data, allTrains: allTrains.data, search: search.data }, null, 2));
        console.log('Output written to backend_output.json');

    } catch (error) {
        console.error('Error verifying backend:', error);
    }
}

verify();
