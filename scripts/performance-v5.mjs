import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import fs from 'node:fs/promises';
process.env.PORT='4188';process.env.SERVE_ROOT='out';
const {server}=await import('./serve.mjs');
const chrome=await launch({chromeFlags:['--headless=new','--no-sandbox']});
try{
 const result=await lighthouse('http://127.0.0.1:4188/',{port:chrome.port,output:['html','json'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
 await fs.mkdir('research/final-v5',{recursive:true});
 await fs.writeFile('research/final-v5/lighthouse-mobile.html',result.report[0]);
 await fs.writeFile('research/final-v5/lighthouse-mobile.json',result.report[1]);
 console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(Object.entries(result.lhr.audits).filter(([k])=>['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','total-byte-weight'].includes(k)).map(([k,v])=>[k,v.displayValue]))},null,2));
}finally{await chrome.kill();await new Promise(r=>server.close(r));}
