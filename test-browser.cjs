const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('HTML CONTENT:', html.substring(0, 500) + '...');
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER ERROR:', err);
  }
})();
