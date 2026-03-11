const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('LOG:', msg.text()));

    await page.goto('http://localhost:4200/login');
    await page.fill('input[type="email"]', 'admin@trainexpress.com');
    await page.fill('input[type="password"]', 'admin123');
    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
    ]);

    console.log('Logged in, navigating to admin dashboard...');
    await page.goto('http://localhost:4200/admin/dashboard');
    await page.waitForTimeout(4000);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Token in storage:', token ? 'YES' : 'NO');

    const stats = await page.evaluate(() => {
        const grid = document.querySelector('.grid');
        return grid ? grid.innerText.replace(/\n+/g, ' | ') : 'No grid found';
    });
    console.log('STATS PANEL:', stats);

    await browser.close();
})();
