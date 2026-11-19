import fs from 'node:fs/promises';
import path from 'node:path';
const html=await fs.readFile('research/avante-original.html','utf8');
const css=await fs.readFile('research/avante-original.css','utf8');
const origin='https://www.avantenucleosocial.com.br/';
const urls=new Set([...html.matchAll(/(?:https:\/\/www\.avantenucleosocial\.com\.br\/)?content\/images\/[a-z0-9]+\.(?:png|jpg)/g)].map(m=>new URL(m[0],origin).href));
for(const p of ['images/logo.png','images/simbolo-avante.png','images/lanca-simbolo.png','images/icons/favicon.ico','images/icons/favicon-32x32.png','images/icons/apple-touch-icon.png']) urls.add(origin+p);
for(const m of css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)]+/g)) urls.add(m[0]);
const manifest=[];
await fs.mkdir('research/avante-assets',{recursive:true});
await Promise.all([...urls].map(async url=>{
 const name=path.basename(new URL(url).pathname),file='research/avante-assets/'+name;
 const response=await fetch(url); if(!response.ok)throw Error(`${response.status} ${url}`);
 const bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(file,bytes);manifest.push({url,file,bytes:bytes.length});
}));
await fs.writeFile('research/avante-assets.json',JSON.stringify(manifest,null,2));
console.log(`Saved ${manifest.length} official assets`);
