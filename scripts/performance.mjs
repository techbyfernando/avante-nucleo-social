import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import fs from 'node:fs/promises';
process.env.PORT='4182';process.env.SERVE_ROOT='dist';const {server}=await import('./serve.mjs');
const chrome=await launch({chromePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless','--disable-gpu','--no-first-run']});
try{
 const result=await lighthouse('http://127.0.0.1:4182/',{port:chrome.port,output:['html','json'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
 await fs.writeFile('research/final/lighthouse-mobile.html',result.report[0]);await fs.writeFile('research/final/lighthouse-mobile.json',result.report[1]);
 console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score*100])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','total-byte-weight'].map(k=>[k,result.lhr.audits[k].displayValue])),failed:Object.entries(result.lhr.audits).filter(([,v])=>v.score!==null&&v.score<.9).map(([k,v])=>({id:k,value:v.displayValue,description:v.description}))},null,2));
}finally{await chrome.kill();server.close();}
