const CLASS_MULTIPLIERS = { '2S': 0.6, 'SL': 1.0, 'CC': 2.2, '3A': 2.1, '2A': 3.2, '1A': 5.5, 'EC': 4.8 };

function testLogic(train, targetCls) {
    const cls = targetCls || 'SL';
    const multiplier = CLASS_MULTIPLIERS[cls] || 1.0;

    let activeClasses = [];
    if (Array.isArray(train.classes)) {
        activeClasses = train.classes.map(c => (c || '').toString().trim().toUpperCase());
    } else if (typeof train.classes === 'string') {
        activeClasses = train.classes.split(',').map(c => c.trim().toUpperCase());
    }
    
    let referenceClass = 'SL';
    if (activeClasses.includes('SL')) {
        referenceClass = 'SL';
    } else if (activeClasses.includes('3A')) {
        referenceClass = '3A';
    } else if (activeClasses.includes('CC')) {
        referenceClass = 'CC';
    } else if (activeClasses.length > 0) {
        referenceClass = activeClasses[0];
    }
    
    const refMultiplier = CLASS_MULTIPLIERS[referenceClass] || 1.0;
    const relativeMultiplier = multiplier / refMultiplier;
    
    const fullPrice = Number(train.basePrice) * relativeMultiplier;
    return Math.floor(fullPrice);
}

const trainShatabdi = { classes: ['CC', 'EC'], basePrice: 900 };
const trainRajdhani = { classes: ['3A', '2A', '1A'], basePrice: 900 };

console.log("--- TEST: SHATABDI (CC REFERENCE) ---");
console.log(`Base Price (CC): 900`);
console.log(`Calc CC: ${testLogic(trainShatabdi, 'CC')} (Expected 900)`);
console.log(`Calc EC: ${testLogic(trainShatabdi, 'EC')} (Expected 1963)`);

console.log("\n--- TEST: RAJDHANI (3A REFERENCE) ---");
console.log(`Base Price (3A): 900`);
console.log(`Calc 3A: ${testLogic(trainRajdhani, '3A')} (Expected 900)`);
console.log(`Calc 2A: ${testLogic(trainRajdhani, '2A')} (Expected 1371)`);
