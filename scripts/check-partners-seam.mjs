import {chromium} from 'playwright';
process.env.PORT='4187';process.env.SERVE_ROOT='out';
const {server}=await import('./serve.mjs');
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
 await page.goto('http://127.0.0.1:4187/',{waitUntil:'networkidle'});
 const data=await page.locator('.partners-track').evaluate(track=>{
  const a=track.getAnimations()[0],groups=[...track.children],groupWidth=groups[0].getBoundingClientRect().width;
  a.pause();const duration=a.effect.getComputedTiming().duration;
  a.currentTime=0;const start=new DOMMatrix(getComputedStyle(track).transform).m41;
  a.currentTime=duration-1;const end=new DOMMatrix(getComputedStyle(track).transform).m41;
  return {groupWidth,duration,start,end,seamError:Math.abs((end-start)+groupWidth),logos:groups[0].querySelectorAll('img').length};
 });
 console.log(width,JSON.stringify(data));if(data.seamError>1||data.logos!==10)process.exitCode=1;
 await page.close();
}
await browser.close();await new Promise(r=>server.close(r));
