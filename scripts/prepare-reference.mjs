import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const html=await fs.readFile('research/template-original.html','utf8');
const urls=[...new Set([...html.matchAll(/https:\/\/(?:images\.unsplash\.com|fonts\.gstatic\.com)\/[^"'\s)<>]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];
await fs.mkdir('reference/assets',{recursive:true});
let localized=html;const manifest=[];
for(let i=0;i<urls.length;i+=6){await Promise.all(urls.slice(i,i+6).map(async url=>{
 const ext=url.includes('woff2')?'woff2':'jpg';const name=crypto.createHash('sha256').update(url).digest('hex').slice(0,16)+'.'+ext;
 const response=await fetch(url);if(!response.ok)throw Error(`${response.status} ${url}`);
 const bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile('reference/assets/'+name,bytes);
 manifest.push({url,path:'reference/assets/'+name,bytes:bytes.length,type:response.headers.get('content-type'),sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 localized=localized.replaceAll(url.replaceAll('&','&amp;'),'assets/'+name).replaceAll(url,'assets/'+name);
 }));}
await fs.writeFile('reference/index.html',localized);
await fs.writeFile('research/template-assets.json',JSON.stringify(manifest,null,2));
await fs.copyFile('tools/template-source/LICENSE','reference/LICENSE');
await fs.copyFile('tools/template-source/CREDITS.md','reference/CREDITS.md');
console.log(`Reference preserved. ${manifest.length} assets localized without changing visual styles, content or behavior.`);
