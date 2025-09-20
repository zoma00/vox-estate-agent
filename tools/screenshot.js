const { chromium } = require('playwright');
const urls = [
  { url: 'http://localhost:3000/', out: 'web_home.png' },
  { url: 'http://localhost:5173/', out: 'mobile_home.png' }
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  for (const u of urls) {
    try {
      await page.goto(u.url, { timeout: 10000 });
      await page.screenshot({ path: u.out, fullPage: true });
      console.log('Saved', u.out);
    } catch (err) {
      console.error('Failed', u.url, err.message);
    }
  }
  await browser.close();
})();
