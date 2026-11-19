import {chromium} from 'playwright';
import fs from 'node:fs/promises';
process.env.PORT='4183';process.env.SERVE_ROOT='dist';const {server}=await import('./serve.mjs');
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
 for(const width of [375,768,1440]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'no-preference',hasTouch:width<900});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4183/',{waitUntil:'networkidle'});await page.waitForTimeout(1200);
  const checks=[];
  for(const id of ['opening','method','disciplines','coaches','video','lab','story-journey','week','partners','stories','recovery','membership','faq','contact','footer']){
   await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(250);
   checks.push(await page.evaluate(id=>({id,viewportOverflow:document.documentElement.scrollWidth>innerWidth,finiteAnimations:document.getAnimations().every(a=>a.playState!=='idle'||a.currentTime===null)}),id));
  }
  await page.locator('.fq-item summary').first().click();const faq=await page.locator('.fq-item').first().getAttribute('open')!==null;
  results.push({width,mode:'animated-production',errors,checks,faq,passed:!errors.length&&checks.every(c=>!c.viewportOverflow)&&faq});await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:4183/');
 const nojs={mode:'without-javascript',disabledSubmit:await page.locator('.ct-form button').isDisabled(),contactLink:await page.locator('a[href="tel:+551126850301"]').count()===1,sections:await page.locator('main>section').count(),storyVisible:await page.locator('.story-char').first().evaluate(el=>getComputedStyle(el).opacity==='1')};nojs.passed=nojs.disabledSubmit&&nojs.contactLink&&nojs.sections===14&&nojs.storyVisible;results.push(nojs);await context.close();
 await fs.writeFile('research/final/production-smoke.json',JSON.stringify({passed:results.every(x=>x.passed),results},null,2));console.log(JSON.stringify(results.map(({checks,...r})=>r),null,2));
}finally{await browser.close();server.close();}
