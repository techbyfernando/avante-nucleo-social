import {chromium} from 'playwright';
import fs from 'node:fs/promises';
process.env.PORT='4186'; process.env.SERVE_ROOT='out';
const {server}=await import('./serve.mjs');
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
await fs.mkdir('research/final-v5',{recursive:true});
for(const width of [320,390,768,1440,1920])for(const reduced of [false,true]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4186/',{waitUntil:'networkidle'});
 const story=page.locator('#story-journey');const section=await story.evaluate(el=>({y:el.getBoundingClientRect().top+scrollY,height:el.getBoundingClientRect().height}));
 await page.evaluate(y=>window.scrollTo(0,y),section.y-360);await page.waitForTimeout(600);
 const start=await page.locator('.story-char').evaluateAll(nodes=>nodes.map(n=>Number(getComputedStyle(n).opacity)));
 await page.evaluate(y=>window.scrollTo(0,y),section.y+section.height*0.35);await page.waitForTimeout(850);
 const mid=await page.locator('.story-char').evaluateAll(nodes=>nodes.map(n=>Number(getComputedStyle(n).opacity)));
 await page.evaluate(y=>window.scrollTo(0,y),section.y+section.height-920);await page.waitForTimeout(850);
 const end=await page.locator('.story-char').evaluateAll(nodes=>nodes.map(n=>Number(getComputedStyle(n).opacity)));
 const average=a=>a.reduce((x,y)=>x+y,0)/a.length;
 await page.screenshot({path:`research/final-v5/story-${width}-${reduced?'reduced':'normal'}.png`});
 await page.locator('.ds-tile--court img').scrollIntoViewIfNeeded();await page.locator('.ds-tile--court img').evaluate(img=>img.decode());
 const state=await page.evaluate(()=>{const img=document.querySelector('.ds-tile--court img'),track=document.querySelector('.partners-track'),groups=[...document.querySelectorAll('.partner-group')];return {src:img?.currentSrc,loaded:img?.complete&&img.naturalWidth>0,logoCount:groups[0]?.querySelectorAll('img').length,groupWidths:groups.map(x=>x.getBoundingClientRect().width),toggle:!!document.querySelector('.partners-toggle'),animation:getComputedStyle(track).animationName,overflow:document.documentElement.scrollWidth-innerWidth,react:document.documentElement.hasAttribute('data-react-theme'),gsap:!!window.gsap,trigger:!!window.ScrollTrigger,lenis:!!window.__avanteLenis}});
 results.push({width,reduced,avg:[average(start),average(mid),average(end)],state,errors,passed:!errors.length&&state.loaded&&state.src.includes('treinamento-v5')&&!state.toggle&&state.logoCount===10&&(reduced?state.groupWidths[1]===0:Math.abs(state.groupWidths[0]-state.groupWidths[1])<1)&&state.overflow<=1&&state.react&&state.gsap&&state.trigger&&(reduced?!state.lenis:state.lenis&&average(start)<average(mid)&&average(mid)<average(end))});
 await context.close();
}
await fs.writeFile('research/final-v5/audit.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({width,reduced,avg,state,passed,errors})=>({width,reduced,avg,passed,errors,animation:state.animation})),null,2));
await browser.close();await new Promise(resolve=>server.close(resolve));
if(results.some(x=>!x.passed))process.exitCode=1;
