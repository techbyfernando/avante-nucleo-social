import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';

// AUDIT_URL can point at the Next preview. Otherwise test the production static build.
let server;
const port = 4185;
if (!process.env.AUDIT_URL) {
  process.env.PORT = String(port);
  process.env.SERVE_ROOT = process.env.AUDIT_ROOT || 'dist';
  ({server} = await import('./serve.mjs'));
}
const url = process.env.AUDIT_URL || `http://127.0.0.1:${port}/`;
const widths = (process.env.AUDIT_WIDTHS || '320,375,390,430,768,1024,1440,1920').split(',').map(Number);
const out = process.env.AUDIT_OUTPUT || 'research/final-v3';
await fs.mkdir(out, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
const result = {url, widths, started: new Date().toISOString(), scenarios: [], interaction: {}, video: {}, errors: []};
const expectedSource = ['v3-atrio','v3-planejamento','v3-presenca','v3-formacao','v3-acesso','v3-articulacao'];
const masterNames = ['atrio','planejamento','presenca','formacao','acesso','articulacao'];
const fail = (scenario, reason) => scenario.failures.push(reason);

async function settle(page, ms = 900) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

async function scrollToSection(page, id) {
  await page.locator(`#${id}`).evaluate(el => {
    const target = scrollY + el.getBoundingClientRect().top - innerHeight * .18;
    window.scrollTo({top: target, behavior: 'instant'});
  });
  await settle(page, 1000);
}

async function inspectSection(page, id) {
  return page.locator(`#${id}`).evaluate(el => {
    const candidates = [...el.querySelectorAll('h2,h3,p,article,img,figure')]
      .filter(node => !node.closest('[aria-hidden="true"]'));
    const visible = candidates.filter(node => {
      const r = node.getBoundingClientRect(), style = getComputedStyle(node);
      return r.width > 0 && r.height > 0 && r.top < innerHeight - 24 && r.bottom > 24 && style.display !== 'none';
    });
    return {
      id: el.id,
      scrollY,
      visibleCount: visible.length,
      hidden: visible.filter(node => Number(getComputedStyle(node).opacity) < .85 || getComputedStyle(node).visibility === 'hidden').map(node => ({tag: node.tagName, text: node.textContent?.trim().slice(0, 60), opacity: getComputedStyle(node).opacity})),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      images: [...el.querySelectorAll('img')].map(img => ({src: img.currentSrc || img.src, naturalWidth: img.naturalWidth, loading: img.loading}))
    };
  });
}

try {
  result.masters = await Promise.all(masterNames.map(async name => {
    const file = `research/generated-v3/${name}-3840x2160.png`;
    const meta = await sharp(file).metadata();
    return {name, file, width: meta.width, height: meta.height, valid: meta.width === 3840 && meta.height === 2160};
  }));
  for (const width of widths) for (const theme of ['light', 'dark']) for (const motion of ['reduce', 'no-preference']) {
    const id = `${width}-${theme}-${motion === 'reduce' ? 'reduced' : 'normal'}`;
    const context = await browser.newContext({viewport: {width, height: width < 768 ? 844 : 1000}, colorScheme: theme, reducedMotion: motion});
    const page = await context.newPage();
    const scenario = {id, failures: [], sections: [], pageErrors: [], missingRequests: []};
    result.scenarios.push(scenario);
    page.on('pageerror', err => scenario.pageErrors.push(err.message));
    page.on('response', response => {if (response.url().startsWith(new URL(url).origin) && response.status() >= 400) scenario.missingRequests.push({url: response.url(), status: response.status()});});
    try {
      await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
      await settle(page);
      const boot = await page.evaluate(() => ({theme: document.documentElement.dataset.theme, motion: document.documentElement.dataset.motion, gsap: Boolean(window.gsap), scrollTrigger: Boolean(window.ScrollTrigger), triggers: window.ScrollTrigger?.getAll().length ?? 0, lenis: Boolean(window.__avanteLenis || document.documentElement.dataset.lenis === 'active'), react: Boolean(document.querySelector('[data-react-root],#__next') || Object.keys(document.getElementById('__next') || {}).some(k => k.startsWith('__react')))}));
      scenario.boot = boot;
      if (boot.theme !== theme) fail(scenario, `system theme ${boot.theme} != ${theme}`);
      if (motion === 'no-preference' && (!boot.gsap || !boot.scrollTrigger || !boot.triggers)) fail(scenario, 'GSAP/ScrollTrigger has no active entrance triggers');
      if (motion === 'no-preference' && !boot.lenis) fail(scenario, 'Lenis not active');
      if (motion === 'reduce' && boot.lenis) fail(scenario, 'Lenis active despite reduced motion');
      for (const section of ['opening','method','disciplines','coaches','video','lab','week','partners','stories','recovery','membership','faq','contact']) {
        await scrollToSection(page, section);
        const state = await inspectSection(page, section);
        scenario.sections.push(state);
        if (state.hidden.length) fail(scenario, `${section}: ${state.hidden.length} elements remain invisible after reveal`);
        if (state.scrollWidth > width + 1) fail(scenario, `${section}: horizontal document overflow ${state.scrollWidth}px`);
      }
      if (scenario.pageErrors.length) fail(scenario, `page errors: ${scenario.pageErrors.join('; ')}`);
      if (scenario.missingRequests.length) fail(scenario, `${scenario.missingRequests.length} local request failures`);
      if ([390, 1440].includes(width)) {
        await page.screenshot({path: `${out}/${id}-full.png`, fullPage: true});
        await scrollToSection(page, 'method');
        await page.screenshot({path: `${out}/${id}-method.png`});
        await scrollToSection(page, 'week');
        await page.screenshot({path: `${out}/${id}-week.png`});
      }
      if ([320,768,1440].includes(width) && motion === 'reduce') {
        const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        scenario.axe = axe.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}));
        if (scenario.axe.length) fail(scenario, `axe ${scenario.axe.map(v => v.id).join(',')}`);
      }
      scenario.passed = scenario.failures.length === 0;
    } catch (error) {fail(scenario, error.message); scenario.passed = false;}
    await context.close();
    await fs.writeFile(`${out}/audit.json`, JSON.stringify(result, null, 2));
    console.log(`${id}: ${scenario.passed ? 'PASS' : 'FAIL'} ${scenario.failures.join(' | ')}`);
  }

  // One functional path also verifies controls and responsive image delivery.
  const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
  const page = await context.newPage();
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.locator('.theme-toggle').click();
  const selectedTheme = await page.locator('html').getAttribute('data-theme');
  await page.reload({waitUntil: 'networkidle'});
  result.interaction.themePersists = await page.locator('html').getAttribute('data-theme') === selectedTheme;
  await page.locator('.nav__menu').click();
  result.interaction.menuOpens = await page.locator('#menu').isVisible();
  await page.keyboard.press('Escape');
  result.interaction.menuCloses = await page.locator('#menu').isHidden();
  const allImages = await page.locator('img').evaluateAll(images => images.map(i => ({src: i.getAttribute('src') || '', srcset: i.getAttribute('srcset') || '', loading: i.loading})));
  result.interaction.generatedImageNames = expectedSource.filter(name => allImages.some(i => i.src.includes(name) || i.srcset.includes(name)));
  result.interaction.sixImagesIntegrated = result.interaction.generatedImageNames.length === 6;
  result.interaction.lazyImages = allImages.filter(i => i.loading === 'lazy').length;
  await scrollToSection(page, 'video');
  result.video.deferred = await page.locator('.video-frame iframe').count() === 0;
  await page.locator('.video-play').click();
  result.video.src = await page.locator('.video-frame iframe').getAttribute('src');
  result.video.integrated = result.video.deferred && result.video.src?.includes('e_FMUXOr1yQ');
  await page.screenshot({path: `${out}/video.png`});
  await context.close();
  result.finished = new Date().toISOString();
  result.passed = result.scenarios.length === widths.length * 4 && result.scenarios.every(s => s.passed) && result.masters.every(m => m.valid) && result.interaction.sixImagesIntegrated && result.interaction.themePersists && result.interaction.menuOpens && result.interaction.menuCloses && result.video.integrated;
} catch (error) {result.errors.push(error.stack || error.message); result.passed = false;}
finally {await fs.writeFile(`${out}/audit.json`, JSON.stringify(result, null, 2)); await browser.close(); if (server) await new Promise(resolve => server.close(resolve));}
console.log(JSON.stringify({passed: result.passed, scenarios: result.scenarios.length, failed: result.scenarios.filter(s => !s.passed).map(s => s.id), interaction: result.interaction, video: result.video, errors: result.errors}, null, 2));
if (!result.passed) process.exitCode = 1;
