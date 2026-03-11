const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('backend_output.json', 'utf8'));
    if (data.search) {
        console.log(`Found ${data.search.length} search results.`);

        // Group prices by class
        const pricesByClass = {};

        data.search.forEach(t => {
            console.log(`\nTrain: ${t.name} (${t.number})`);
            t.classes.forEach(c => {
                console.log(`  ${c.type}: ₹${c.price}`);

                if (!pricesByClass[c.type]) pricesByClass[c.type] = [];
                pricesByClass[c.type].push({ train: t.number, price: c.price });
            });
        });

        console.log('\n--- Uniqueness Check ---');
        Object.keys(pricesByClass).forEach(cls => {
            const prices = pricesByClass[cls].map(x => x.price);
            const uniquePrices = new Set(prices);
            console.log(`Class ${cls}: ${prices.length} trains, ${uniquePrices.size} unique prices. values: [${prices.join(', ')}]`);
            if (prices.length !== uniquePrices.size) {
                console.log(`  WARNING: Duplicate prices found in Class ${cls}!`);
            } else {
                console.log(`  OK: All prices unique for Class ${cls}.`);
            }
        });

    } else {
        console.log('No search results found');
    }
} catch (e) {
    console.error(e);
}
