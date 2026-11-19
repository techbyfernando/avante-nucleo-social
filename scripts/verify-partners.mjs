import { chromium, webkit, devices } from 'playwright';

const engine = process.env.BROWSER_ENGINE === 'webkit' ? webkit : chromium;
const browser = await engine.launch(process.env.BROWSER_ENGINE === 'webkit' ? { headless: true } : { headless: true, channel: 'chrome' });
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4190';
let failed = false;
for (const width of [320, 375, 390, 430, 768, 1440]) {
  const context = await browser.newContext({
    ...(width <= 430 ? devices['iPhone 13'] : {}),
    viewport: { width, height: width <= 430 ? 844 : 900 },
    deviceScaleFactor: width <= 430 ? 3 : 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => {
    const head = document.querySelector('#partners .partners-head');
    const eyebrow = head.querySelector('.eyebrow');
    const title = head.querySelector('h2');
    const description = document.querySelector('#partners .partner-description');
    const center = element => { const rect = element.getBoundingClientRect(); return rect.left + rect.width / 2; };
    const viewportCenter = document.documentElement.clientWidth / 2;
    const logo = document.querySelector('.nav__logo img');
    const logoUrl = new URL(logo.getAttribute('src'), location.href);
    const logoResponse = await fetch(logoUrl);
    const logoSvg = await logoResponse.text();
    const icon = document.querySelector('.theme-toggle svg');
    return {
      centers: [eyebrow, title, description].map(center),
      viewportCenter,
      textAlign: [eyebrow, title, description].map(el => getComputedStyle(el).textAlign),
      logoLoaded: logo.complete && logo.naturalWidth > 0,
      logoContentType: logoResponse.headers.get('content-type'),
      vectorPaths: (logoSvg.match(/<path\b/g) || []).length,
      iconPaths: icon.querySelectorAll('path, circle').length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
  const centered = result.centers.every(value => Math.abs(value - result.viewportCenter) < 3);
  const good = centered && result.textAlign.every(value => value === 'center') && result.logoLoaded && result.logoContentType?.includes('image/svg+xml') && result.vectorPaths > 0 && result.iconPaths > 0 && !result.horizontalOverflow && errors.length === 0;
  if (!good) failed = true;
  console.log(JSON.stringify({ width, good, ...result, errors }));
  await context.close();
}
await browser.close();
if (failed) process.exitCode = 1;
