import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
process.env.PORT='4181';const {server}=await import('./serve.mjs');
const browser=await chromium.launch({channel:'chrome',headless:true});
await fs.mkdir('research/final',{recursive:true});
const results={date:new Date().toISOString(),pages:[],interactions:[],video:{}};
try{
 for(const width of [375,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:width<768?844:1000},reducedMotion:'reduce',deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),font:getComputedStyle(document.body).fontFamily,colors:['--color-3','--accent','--color-4'].map(k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim()),sections:[...document.querySelectorAll('main>section')].map(s=>({id:s.id,height:s.offsetHeight})),headingOverflow:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.scrollWidth>e.clientWidth+3).map(e=>({text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth}))}));
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await page.screenshot({path:`research/final/${width}-hero.png`});
  await page.screenshot({path:`research/final/${width}-full.png`,fullPage:true});
  results.pages.push({width,...layout,errors,accessibility:accessibility.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  if(width===390){
   await page.locator('.nav__menu').click();results.interactions.push({name:'mobile menu opens',passed:await page.locator('#menu').isVisible()});await page.screenshot({path:'research/final/mobile-menu.png'});await page.keyboard.press('Escape');results.interactions.push({name:'Escape closes menu',passed:await page.locator('#menu').isHidden()});
   await page.locator('.nav__menu').click();await page.locator('.menu a[href="#partners"]').click();results.interactions.push({name:'menu anchor closes and navigates',passed:await page.locator('#menu').isHidden()&&page.url().endsWith('#partners')});
   const faq=page.locator('.fq-item').first();await faq.locator('summary').click();results.interactions.push({name:'FAQ opens',passed:await faq.getAttribute('open')!==null});await faq.locator('summary').click();results.interactions.push({name:'FAQ closes',passed:await faq.getAttribute('open')===null});
   await page.locator('.ct-form button').click();results.interactions.push({name:'form rejects missing fields',passed:await page.locator('#name-error').textContent()==='Informe seu nome.'});
   await page.locator('[name="name"]').fill('Teste de validação');await page.locator('[name="email"]').fill('teste@example.com');
   await page.evaluate(()=>{window.__opened=[];window.open=(url)=>{window.__opened.push(url);return null;};});await page.locator('.ct-form button').click();
   results.interactions.push({name:'form prepares WhatsApp without sending',passed:await page.evaluate(()=>window.__opened[0]?.startsWith('https://api.whatsapp.com/send?phone=5511947446597&text='))});
   results.interactions.push({name:'reduced motion stops carousel',passed:await page.locator('.partners-track').evaluate(el=>getComputedStyle(el).animationName==='none')});
  }
  await context.close();console.log('Audited',width);
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4181/',{waitUntil:'networkidle'});await page.waitForTimeout(1400);await page.screenshot({path:'research/final/desktop-animated-hero.png'});
 for(const id of ['method','disciplines','coaches','video','lab','week','partners','stories','recovery','membership','faq','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`research/final/desktop-${id}.png`});}
 await page.locator('.partners-toggle').click();results.interactions.push({name:'carousel pause control',passed:await page.locator('.partners-track').evaluate(el=>getComputedStyle(el).animationPlayState==='paused')});await page.locator('.partners-toggle').click();
 const groupWidth=await page.locator('.partner-group').first().evaluate(el=>el.getBoundingClientRect().width);const trackWidth=await page.locator('.partners-track').evaluate(el=>el.getBoundingClientRect().width);results.interactions.push({name:'carousel seamless duplicated width',passed:Math.abs(trackWidth-groupWidth*2)<1});
 await page.locator('.video-play').click();results.video.src=await page.locator('.video-frame iframe').getAttribute('src');
 await page.waitForTimeout(10000);
 const videoFrame=page.frames().find(f=>f.url().includes('youtube.com/embed/'));
 results.video.observation=videoFrame?await videoFrame.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,800),video:[...document.querySelectorAll('video')].map(v=>({readyState:v.readyState,currentTime:v.currentTime,paused:v.paused,error:v.error?.code||null})),playerClass:document.querySelector('.html5-video-player')?.className})).catch(e=>({error:e.message})):{error:'frame unavailable'};
 await page.screenshot({path:'research/final/video-playback.png'});await context.close();
 results.passed=results.pages.every(p=>p.errors.length===0&&p.brokenImages.length===0&&p.scrollWidth<=p.width&&p.accessibility.length===0)&&results.interactions.every(x=>x.passed);
 await fs.writeFile('research/final/audit.json',JSON.stringify(results,null,2));
 const desktop=await sharp('research/final/1440-full.png').resize({width:480}).png().toBuffer();await fs.writeFile('research/final/desktop-overview.png',desktop);
 console.log(JSON.stringify({passed:results.passed,pages:results.pages.map(p=>({width:p.width,overflow:p.scrollWidth>p.width,headings:p.headingOverflow,axe:p.accessibility.map(v=>({id:v.id,count:v.nodes.length})),errors:p.errors})),interactions:results.interactions,video:results.video},null,2));
}finally{await browser.close();server.close();}
