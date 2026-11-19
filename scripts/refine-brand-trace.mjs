import fs from 'node:fs/promises';import sharp from 'sharp';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),potrace=require('../tools/brand-work/node_modules/potrace');
const original=await fs.readFile('research/avante-assets/logo.png');
const {data:a,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const mask=await sharp(original).extractChannel('alpha').resize(3040,640,{kernel:'lanczos3'}).negate().png().toBuffer();
const outcomes=[];let best;
for(const threshold of [112,120,128,136,144])for(const alphaMax of [0,.3,.6,1]){
 const raw=await new Promise((resolve,reject)=>potrace.trace(mask,{color:'#e8f1f2',background:'transparent',threshold,turdSize:0,alphaMax,optTolerance:.02},(err,svg)=>err?reject(err):resolve(svg)));
 const svg=raw.replace('width="3040" height="640"','width="380" height="80"').replace(/<svg([^>]*)>/,'<svg$1><title>Avante Núcleo Social</title>');
 const b=await sharp(Buffer.from(svg)).resize(info.width,info.height).ensureAlpha().raw().toBuffer();let err=0,intersection=0,union=0,different=0;
 for(let i=0;i<a.length;i+=4){err+=Math.abs(a[i+3]-b[i+3]);const x=a[i+3]>=128,y=b[i+3]>=128;if(x||y)union++;if(x&&y)intersection++;if(x!==y)different++;}
 const m={threshold,alphaMax,alphaMeanAbsoluteError:err/(info.width*info.height),maskIoU:intersection/union,differingBinaryPixels:different,bytes:Buffer.byteLength(svg)};
 outcomes.push(m);if(!best||m.alphaMeanAbsoluteError<best.metrics.alphaMeanAbsoluteError)best={metrics:m,svg};
}
await fs.writeFile('research/brand-validation/trace-iterations.json',JSON.stringify(outcomes,null,2));
await fs.writeFile('public/assets/brand/avante.svg',best.svg);
let comparison=JSON.parse(await fs.readFile('research/brand-validation/logo-comparison.json'));comparison={...comparison,...best.metrics,method:'Potrace alpha silhouette at 8x; best of 20 threshold/curve settings selected by alpha MAE; no type reconstruction or redesign'};
await fs.writeFile('research/brand-validation/logo-comparison.json',JSON.stringify(comparison,null,2));
let manifest=JSON.parse(await fs.readFile('public/assets/brand/manifest.json'));manifest.logo={...manifest.logo,...comparison};manifest.partners=JSON.parse(await fs.readFile('public/assets/partners/manifest.json'));await fs.writeFile('public/assets/brand/manifest.json',JSON.stringify(manifest,null,2));
const top=await sharp(original).flatten({background:'#0a4049'}).resize(760,160).png().toBuffer();const bottom=await sharp(Buffer.from(best.svg)).resize(760,160).flatten({background:'#0a4049'}).png().toBuffer();
await sharp({create:{width:800,height:380,channels:3,background:'#0a4049'}}).composite([{input:top,left:20,top:20},{input:bottom,left:20,top:200}]).png().toFile('research/brand-validation/logo-comparison.png');
console.log(best.metrics);
