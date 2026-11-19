import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { load } from 'cheerio';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run only after index.html, refinement.css and experience.js have been integrated.
// A new context per scenario prevents previous theme preferences masking system mode.
process.env.PORT = '4184';
const { server } = await import('./serve.mjs');
const base = 'http://127.0.0.1:4184';
const output = 'research/final-v2';
const widths = (process.env.AUDIT_WIDTHS || '320,375,390,430,768,1024,1440,1920').split(',').map(Number);
const report = { started: new Date().toISOString(), widths, scenarios: [], interactions: [], video: {}, exceptions: [] };
const check = (name, passed, details = {}) => report.interactions.push({ name, passed: Boolean(passed), ...details });
const normalize = text => text.replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim().replace(/[.]+$/, '');
const source = load(await fs.readFile('research/avante-original.html', 'utf8'));
const quotes = source('.testimonial').toArray().map(el => ({ attribution: source(el).find('h3').text().trim(), text: normalize(source(el).find('span').text()) }));
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function settle(page, ms = 650) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

async function scrollTo(page, selector, fraction = 0.2) {
  await page.locator(selector).evaluate((el, f) => {
    window.scrollTo({ top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - innerHeight * f), behavior: 'instant' });
  }, fraction);
  await settle(page);
}

async function geometry(page) {
  return page.evaluate(() => {
    const rectangle = r => ({ x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
    const rendered = el => {
      const style = getComputedStyle(el), r = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    };
    const headings = [...document.querySelectorAll('h1,h2,h3')].filter(rendered).map(el => {
      const r = el.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(el);
      const text = [...range.getClientRects()].filter(t => t.width > 0 && t.height > 0);
      const left = Math.min(...text.map(t => t.left)), right = Math.max(...text.map(t => t.right));
      const carouselViewport = el.closest('.wk-view')?.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && (!carouselViewport || (r.right > carouselViewport.left && r.left < carouselViewport.right));
      return { text: el.textContent.trim().slice(0, 100), id: el.id, rect: rectangle(r), onScreen, opacity: getComputedStyle(el).opacity,
        overflow: el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 3,
        viewportOverflow: onScreen && !carouselViewport && (left < -3 || right > innerWidth + 3) };
    });
    const rowText = [...document.querySelectorAll('.mt-row')].map(el => {
      const r = el.getBoundingClientRect();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const rects = [];
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(walker.currentNode);
        for (const t of range.getClientRects()) if (t.width > 0) rects.push(rectangle(t));
      }
      const intersections = [];
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (Math.min(a.right, b.right) - Math.max(a.x, b.x) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 2) intersections.push([i, j]);
      }
      return { text: el.textContent.trim(), rect: rectangle(r), textRects: rects, intersections };
    });
    const ctas = [...document.querySelectorAll('.op-meta a,.op-actions a,.ct-send button,.nav__cta')].filter(rendered).map(el => {
      const r = el.getBoundingClientRect(); let clipped = false;
      for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent), p = parent.getBoundingClientRect();
        if (['hidden', 'clip'].includes(style.overflowX) && (r.left < p.left - 3 || r.right > p.right + 3)) clipped = true;
        if (['hidden', 'clip'].includes(style.overflowY) && (r.top < p.top - 3 || r.bottom > p.bottom + 3)) clipped = true;
      }
      return { text: el.textContent.trim(), rect: rectangle(r), clipped };
    });
    return { y: scrollY, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, headings, rowText, ctas };
  });
}

async function safeInteraction(name, fn) {
  try { await fn(); } catch (error) { check(name, false, { error: error.message }); }
}

try {
  for (const file of ['index.html', 'public/assets/experience.js', 'public/assets/refinement.css']) {
    const data = await fs.readFile(file);
    (report.files ||= []).push({ file, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
  }

  for (const width of widths) for (const scheme of ['light', 'dark']) for (const motion of ['reduce', 'no-preference']) {
    const height = width < 768 ? 844 : width >= 1920 ? 1080 : 1000;
    const id = `${width}-${scheme}-${motion === 'reduce' ? 'reduced' : 'normal'}`;
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion: motion, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [], consoleErrors = [], failedLocalRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedLocalRequests.push({ url: response.url(), status: response.status() }); });
    const scenario = { id, width, height, scheme, motion, errors, consoleErrors, failedLocalRequests, samples: [], accessibility: [] };
    report.scenarios.push(scenario);
    try {
      await page.goto(base, { waitUntil: 'networkidle' });
      await settle(page, 1200);
      await page.evaluate(async () => { await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })); });
      scenario.theme = await page.evaluate(() => ({ attribute: document.documentElement.dataset.theme, motion: document.documentElement.dataset.motion, colorScheme: getComputedStyle(document.documentElement).colorScheme, bodyBackground: getComputedStyle(document.body).backgroundColor }));
      scenario.themeMatchesSystem = scenario.theme.attribute === scheme;
      scenario.missingImages = await page.evaluate(() => [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.currentSrc || image.src));
      scenario.removedOrnaments = await page.locator('.op-ring,.m-orb').count() === 0;
      scenario.brandStyles = await page.locator('.partner-group:first-child img,.nav__logo img,.ft-word img,.brand-logo').evaluateAll(images => images.map(image => {
        const effects = [];
        for (let el = image; el && el !== document.body; el = el.parentElement) {
          const style = getComputedStyle(el);
          if (style.filter !== 'none') effects.push({ className: el.className, filter: style.filter });
        }
        return { src: image.currentSrc, alt: image.alt, effects };
      }));
      scenario.samples.push({ section: 'opening', ...await geometry(page) });
      await page.screenshot({ path: `${output}/${id}-hero.png` });
      // Both normal and reduced mode are measured, including text while scrolling.
      const sections = motion === 'no-preference' ? ['method', 'disciplines', 'lab', 'week', 'stories', 'recovery', 'contact'] : ['method', 'stories', 'contact'];
      for (const section of sections) {
        await scrollTo(page, `#${section}`);
        scenario.samples.push({ section, ...await geometry(page) });
        await page.screenshot({ path: `${output}/${id}-${section}.png` });
        if (section === 'method' && motion === 'no-preference') {
          await page.mouse.wheel(0, 220); await page.waitForTimeout(180);
          scenario.samples.push({ section: 'method-during-scroll', ...await geometry(page) });
          await page.screenshot({ path: `${output}/${id}-method-during-scroll.png` });
        }
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await settle(page);
      await page.screenshot({ path: `${output}/${id}-full.png`, fullPage: true });
      if ([320, 768, 1440].includes(width) && motion === 'reduce') {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        scenario.accessibility = axe.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
        scenario.axeExecuted = true;
      }
      const testimonialText = normalize(await page.locator('#depoimentos-completos').innerText());
      scenario.completeTestimonials = quotes.map(quote => ({ attribution: quote.attribution, found: testimonialText.includes(quote.text) }));
      scenario.oldTestimonialLinkCount = await page.locator('a[href="https://www.avantenucleosocial.com.br/#depoimentos"]').count();
      scenario.internalTestimonialLinkCount = await page.locator('a[href="#depoimentos-completos"]').count();
      scenario.carousel = await page.locator('.partners-track').evaluate(el => ({ animationName: getComputedStyle(el).animationName, animationPlayState: getComputedStyle(el).animationPlayState }));

      if (width === 390 && scheme === 'dark' && motion === 'reduce') {
        await safeInteraction('theme toggle/persistence', async () => {
          check('system dark on fresh context', await page.locator('html').getAttribute('data-theme') === 'dark');
          await page.locator('.theme-toggle').click(); await settle(page, 200);
          check('toggle dark to light', await page.locator('html').getAttribute('data-theme') === 'light');
          await page.reload({ waitUntil: 'networkidle' });
          check('explicit light persists over dark system', await page.locator('html').getAttribute('data-theme') === 'light');
          await page.locator('.theme-toggle').click(); await page.reload({ waitUntil: 'networkidle' });
          check('toggle back dark persists', await page.locator('html').getAttribute('data-theme') === 'dark');
        });
        await safeInteraction('mobile menu/keyboard/anchor', async () => {
          await page.locator('.nav__menu').click();
          check('mobile menu opens', await page.locator('#menu').isVisible());
          await page.screenshot({ path: `${output}/mobile-menu-dark.png` });
          await page.keyboard.press('Escape'); check('Escape closes menu', await page.locator('#menu').isHidden());
          await page.locator('.nav__menu').click(); await page.locator('.menu a[href="#partners"]').click();
          check('menu anchor closes and navigates', await page.locator('#menu').isHidden() && page.url().endsWith('#partners'));
        });
        await safeInteraction('FAQ', async () => {
          const faq = page.locator('.fq-item').first(); await faq.locator('summary').click(); check('FAQ opens', await faq.getAttribute('open') !== null);
          await faq.locator('summary').click(); check('FAQ closes', await faq.getAttribute('open') === null);
        });
        await safeInteraction('form validates and prepares real destination', async () => {
          await scrollTo(page, '#contact'); await page.locator('.ct-form button').click();
          check('form rejects missing name', /nome/i.test(await page.locator('#name-error').innerText()));
          await page.locator('[name="name"]').fill('Teste de validação'); await page.locator('[name="email"]').fill('teste@example.com');
          await page.evaluate(() => { window.__opened = []; window.open = url => { window.__opened.push(url); return null; }; });
          await page.locator('.ct-form button').click();
          check('form opens WhatsApp draft without sending', await page.evaluate(() => window.__opened.some(url => /5511947446597/.test(url))));
        });
      }
      scenario.passed = scenario.themeMatchesSystem && scenario.theme.motion === (motion === 'reduce' ? 'reduced' : 'gsap') && !errors.length && !consoleErrors.length && !failedLocalRequests.length && !scenario.missingImages.length && scenario.removedOrnaments
        && scenario.samples.every(sample => sample.scrollWidth <= width + 1 && !sample.headings.some(h => h.overflow || h.viewportOverflow || (h.onScreen && Number(h.opacity) < 0.8)) && !sample.rowText.some(row => row.intersections.length) && !sample.ctas.some(cta => cta.clipped))
        && !scenario.accessibility.length && scenario.completeTestimonials.every(quote => quote.found) && !scenario.oldTestimonialLinkCount && scenario.internalTestimonialLinkCount > 0
        && scenario.brandStyles.every(brand => brand.effects.length === 0)
        && (motion !== 'reduce' || scenario.carousel.animationName === 'none');
    } catch (error) { scenario.exception = error.message; scenario.passed = false; }
    await context.close();
    await fs.writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ scenario: id, passed: scenario.passed, exception: scenario.exception, errors, consoleErrors, axe: scenario.accessibility.map(v => v.id) }));
  }

  await safeInteraction('partner controls and seamless carousel', async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage(); await page.goto(base, { waitUntil: 'networkidle' }); await scrollTo(page, '#partners');
    await page.locator('.partners-toggle').click(); check('carousel pause', await page.locator('.partners-track').evaluate(el => getComputedStyle(el).animationPlayState === 'paused'));
    await page.locator('.partners-toggle').click();
    const sizes = await page.locator('.partners-track').evaluate(el => ({ track: el.getBoundingClientRect().width, group: el.querySelector('.partner-group').getBoundingClientRect().width }));
    check('seamless groups have equal total width', Math.abs(sizes.track - sizes.group * 2) <= 2, sizes);
    await context.close();
  });

  // No mocked media: expose actual playback and external-service limitations.
  const videoContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const videoPage = await videoContext.newPage();
  await videoPage.goto(base, { waitUntil: 'networkidle' }); await scrollTo(videoPage, '#video');
  report.video.deferredUntilClick = await videoPage.locator('.video-frame iframe').count() === 0;
  await videoPage.locator('.video-play').click();
  report.video.src = await videoPage.locator('.video-frame iframe').getAttribute('src');
  report.video.title = await videoPage.locator('.video-frame iframe').getAttribute('title');
  await videoPage.waitForTimeout(12000);
  const frame = videoPage.frames().find(f => /youtube(?:-nocookie)?\.com\/embed\//.test(f.url()));
  const inspectVideo = async () => frame ? frame.evaluate(() => ({ title: document.title, message: document.body.innerText.slice(0, 1200), media: [...document.querySelectorAll('video')].map(v => ({ readyState: v.readyState, currentTime: v.currentTime, paused: v.paused, error: v.error?.code || null })) })).catch(error => ({ error: error.message })) : { error: 'YouTube frame unavailable' };
  report.video.before = await inspectVideo(); await videoPage.waitForTimeout(3000); report.video.after = await inspectVideo();
  report.video.playbackObserved = report.video.after.media?.some((v, i) => v.currentTime > (report.video.before.media?.[i]?.currentTime || 0) && v.readyState >= 2) || false;
  report.video.integrationPassed = report.video.deferredUntilClick && report.video.src?.includes('/embed/e_FMUXOr1yQ') && Boolean(report.video.title);
  await videoPage.screenshot({ path: `${output}/youtube-playback.png` }); await videoContext.close();
  report.finished = new Date().toISOString();
  report.passed = report.scenarios.length === widths.length * 4 && report.scenarios.every(s => s.passed) && report.interactions.every(i => i.passed) && report.video.integrationPassed && report.video.playbackObserved;
} catch (error) { report.exceptions.push(error.stack || error.message); report.passed = false; }
finally {
  await fs.writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2));
  await browser.close(); await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify({ passed: report.passed, scenarios: report.scenarios.length, failed: report.scenarios.filter(s => !s.passed).map(s => s.id), interactions: report.interactions, video: report.video, exceptions: report.exceptions }, null, 2));
if (!report.passed) process.exitCode = 1;
