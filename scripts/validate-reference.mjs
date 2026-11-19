import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';
import crypto from 'node:crypto';
process.env.PORT='4180';
const {server}=await import('./serve.mjs');
const remote='https://fitness-website-template-for-vibe-coding-free-html-v1.21st.app/';
const manifest=JSON.parse(await fs.readFile('research/template-assets.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
await fs.mkdir('research/comparisons',{recursive:true});
const report={date:new Date().toISOString(),source:remote,assetPolicy:'Both pages use identical downloaded public asset bytes. Original HTML fetched live; local copy changes only asset URLs.',cases:[]};
for(const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844}]){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 await context.route(/https:\/\/(images\.unsplash\.com|fonts\.gstatic\.com)\//,async route=>{const item=manifest.find(i=>i.url===route.request().url());if(item)await route.fulfill({body:await fs.readFile(item.path),contentType:item.type});else await route.continue();});
 const original=await context.newPage(),local=await context.newPage();
 await Promise.all([original.goto(remote,{waitUntil:'load'}),local.goto('http://127.0.0.1:4180/reference/',{waitUntil:'load'})]);
 await Promise.all([original.evaluate(()=>document.fonts.ready),local.evaluate(()=>document.fonts.ready)]);
 for(const page of [original,local]){await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});}
 const sections=await original.locator('main>section,footer').evaluateAll(els=>els.map(el=>({id:el.id,y:Math.round(el.getBoundingClientRect().top+scrollY)})));
 const positions=[{id:'hero',y:0},{id:'opening-mid',y:Math.round(viewport.height*.7)},...sections.filter(x=>x.id!=='opening')];
 for(const pos of positions){
  await Promise.all([original,local].map(p=>p.evaluate(y=>{window.motionKit?.wheel?.stop();scrollTo(0,y);},pos.y)));
  await original.waitForTimeout(1300);
  // Freeze only clock-driven effects at the same phase; scroll timelines retain the measured scroll position.
  await Promise.all([original,local].map(p=>p.evaluate(()=>{for(const a of document.getAnimations()){if(a.timeline instanceof DocumentTimeline){a.pause();a.currentTime=5000;}}})));
  const base=`research/comparisons/${viewport.width}-${pos.id}`;
  const [a,b]=await Promise.all([original.screenshot({path:base+'-original.png'}),local.screenshot({path:base+'-local.png'})]);
  const pa=PNG.sync.read(a),pb=PNG.sync.read(b),diff=new PNG({width:pa.width,height:pa.height});
  const n=pixelmatch(pa.data,pb.data,diff.data,pa.width,pa.height,{threshold:.1});
  await fs.writeFile(base+'-diff.png',PNG.sync.write(diff));
  report.cases.push({viewport,position:pos,pixelsDifferent:n,percent:n/(pa.width*pa.height)*100});
 }
 if(viewport.width<=900){await Promise.all([original,local].map(p=>p.evaluate(()=>scrollTo(0,0))));await original.waitForTimeout(600);await Promise.all([original,local].map(p=>p.locator('.nav__menu').click()));await original.waitForTimeout(600);const a=PNG.sync.read(await original.screenshot({path:`research/comparisons/${viewport.width}-menu-original.png`}));const b=PNG.sync.read(await local.screenshot({path:`research/comparisons/${viewport.width}-menu-local.png`}));const n=pixelmatch(a.data,b.data,null,a.width,a.height,{threshold:.1});report.cases.push({viewport,position:{id:'menu'},pixelsDifferent:n,percent:n/(a.width*a.height)*100});}
 await context.close();console.log('Compared',viewport.width);
}
report.maxDifferencePercent=Math.max(...report.cases.map(c=>c.percent));
report.sourceSha256=crypto.createHash('sha256').update(await fs.readFile('research/template-original.html')).digest('hex');
report.passed=report.maxDifferencePercent<=.1;
await fs.writeFile('research/reference-validation.json',JSON.stringify(report,null,2));
await browser.close();console.log(JSON.stringify({cases:report.cases.length,maxDifferencePercent:report.maxDifferencePercent,passed:report.passed}));
server.close();
if(!report.passed)process.exitCode=1;
