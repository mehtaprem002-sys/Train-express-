async function verifyFix() {
    const baseUrl = 'http://localhost:5000/api';
    const trainNumber = '12216';
    const date = '2026-04-18';
    const classType = '1A';

    try {
        console.log(`--- VERIFYING PRICING SYNCHRONIZATION ---`);
        
        // 1. Check User Search Result
        console.log(`Checking User Search (Surat to New Delhi)...`);
        const searchRes = await fetch(`${baseUrl}/trains/search?from=SURAT&to=NEW DELHI&date=${date}`);
        const searchData = await searchRes.json();
        
        const train = searchData.find(t => t.number === trainNumber);
        if (train) {
            const cls = train.classes.find(c => c.type === classType);
            console.log(`User Search Price (1A): ₹${cls.price}`);
        } else {
            console.log(`Train 12216 not found in search results.`);
        }

        // 2. Check Admin Simulation
        console.log(`\nChecking Admin Simulation...`);
        const trainsRes = await fetch(`${baseUrl}/trains`);
        const trainsData = await trainsRes.json();
        const trainDoc = trainsData.find(t => t.number === trainNumber);
        
        if (trainDoc) {
            const simRes = await fetch(`${baseUrl}/trains/${trainDoc._id}/simulate?date=${date}&classType=${classType}&dist=1367`);
            const simData = await simRes.json();
            console.log(`Admin Simulation Price (1A): ₹${simData.price}`);
        } else {
            console.log(`Train 12216 not found in global list.`);
        }

    } catch (e) {
        console.error('Verification failed:', e.message);
    }
}

verifyFix();
