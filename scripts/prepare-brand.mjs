import fs from 'node:fs/promises';
import sharp from 'sharp';
import {createRequire} from 'node:module';
import crypto from 'node:crypto';
const require=createRequire(import.meta.url);
const potrace=require('../tools/brand-work/node_modules/potrace');
const source='research/avante-assets/';
await fs.mkdir('public/assets/brand',{recursive:true});
await fs.mkdir('public/assets/partners',{recursive:true});
await fs.mkdir('research/brand-validation',{recursive:true});
const original=await fs.readFile(source+'logo.png');
await fs.writeFile('public/assets/brand/avante-original.png',original);
const mask=await sharp(original).extractChannel('alpha').resize(1520,320,{kernel:'lanczos3'}).negate().png().toBuffer();
const traced=await new Promise((resolve,reject)=>potrace.trace(mask,{color:'#e8f1f2',background:'transparent',threshold:128,turdSize:0,optTolerance:.1},(err,svg)=>err?reject(err):resolve(svg)));
const svg=traced.replace('width="1520" height="320"','width="380" height="80"').replace(/<svg([^>]*)>/,'<svg$1><title>Avante Núcleo Social</title>');
await fs.writeFile('public/assets/brand/avante.svg',svg);
const {data:a,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const b=await sharp(Buffer.from(svg)).resize(info.width,info.height).ensureAlpha().raw().toBuffer();
let err=0,union=0,intersection=0,different=0;
for(let i=0;i<a.length;i+=4){err+=Math.abs(a[i+3]-b[i+3]);const x=a[i+3]>=128,y=b[i+3]>=128;if(x||y)union++;if(x&&y)intersection++;if(x!==y)different++;}
const comparison={source:'https://www.avantenucleosocial.com.br/images/logo.png',originalSha256:crypto.createHash('sha256').update(original).digest('hex'),width:info.width,height:info.height,sourceFill:'#e8f1f2',method:'Potrace alpha silhouette at 4x; no type reconstruction or geometric redesign',alphaMeanAbsoluteError:err/(info.width*info.height),maskIoU:intersection/union,differingBinaryPixels:different,canvasPixels:info.width*info.height,svgHasEmbeddedRaster: /<image|data:image/.test(svg)};
await fs.writeFile('research/brand-validation/logo-comparison.json',JSON.stringify(comparison,null,2));
const originalPreview=await sharp(original).flatten({background:'#0a4049'}).resize(760,160).png().toBuffer();
const vectorPreview=await sharp(Buffer.from(svg)).resize(760,160).flatten({background:'#0a4049'}).png().toBuffer();
await sharp({create:{width:800,height:380,channels:3,background:'#0a4049'}}).composite([{input:originalPreview,left:20,top:20},{input:vectorPreview,left:20,top:200}]).png().toFile('research/brand-validation/logo-comparison.png');
for(const name of ['favicon.ico','favicon-32x32.png','apple-touch-icon.png','simbolo-avante.png','lanca-simbolo.png'])await fs.copyFile(source+name,'public/assets/brand/'+name);
const partners=[
 ['internacional','Internacional Shopping','b6b7733415bc76f2235a50244d0436e2.jpg'],
 ['bourbon','Bourbon Shopping','09fc1aef95c92ecc18551ddb81639873.jpg'],
 ['jardim-sul','Jardim Sul Shopping','f20e7f0743af0c58f9a516d841aeb7e2.jpg'],
 ['santana-parque','Santana Parque','b5677f679d86d41f4a1439c5b0b81220.jpg'],
 ['campo-limpo','Campo Limpo Shopping','91dcc30b1eb1fb0b05b2191c9faa3b03.jpg'],
 ['metro-santa-cruz','Shopping Metrô Santa Cruz','df6a0519d460cb90bccf9962630f447d.jpg'],
 ['mooca-plaza','Mooca Plaza Shopping','6fa25eac8818e4c967658f96e43ba8d9.jpg'],
 ['itapecerica','Itapecerica Shopping','9bfb20c3c3b889253dcfdaeb959c3774.jpg'],
 ['center-norte','Shopping Center Norte','614d466884f9a5467eba41673dec8091.jpg'],
 ['west-plaza','West Plaza Shopping','9ae9e82030c9b5c849f3c9b0a7484f04.jpg']
];
const manifest=[];
for(const [id,name,file] of partners){
 const bytes=await fs.readFile(source+file);await fs.writeFile(`public/assets/partners/${id}-original.jpg`,bytes);
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Remove only almost-white pixels connected to the exterior. Enclosed whites remain intact.
 const visited=new Uint8Array(info.width*info.height),queue=[];
 const enqueue=(x,y)=>{if(x<0||y<0||x>=info.width||y>=info.height)return;const i=y*info.width+x;if(visited[i])return;const o=i*4;if(data[o]>=253&&data[o+1]>=253&&data[o+2]>=253){visited[i]=1;queue.push(i);}};
 for(let x=0;x<info.width;x++){enqueue(x,0);enqueue(x,info.height-1);}for(let y=0;y<info.height;y++){enqueue(0,y);enqueue(info.width-1,y);}
 for(let q=0;q<queue.length;q++){const i=queue[q],x=i%info.width,y=Math.floor(i/info.width);enqueue(x-1,y);enqueue(x+1,y);enqueue(x,y-1);enqueue(x,y+1);}
 for(const i of queue)data[i*4+3]=0;
 await sharp(data,{raw:info}).png({compressionLevel:9}).toFile(`public/assets/partners/${id}.png`);
 manifest.push({id,name,relationship:'Cliente apresentado no site institucional',source:'https://www.avantenucleosocial.com.br/content/images/'+file,original:`public/assets/partners/${id}-original.jpg`,path:`public/assets/partners/${id}.png`,width:info.width,height:info.height,originalSha256:crypto.createHash('sha256').update(bytes).digest('hex'),transparentExteriorPixels:queue.length,vector:false,limitation:'JPEG 166 × 106 com compressão, letras finas e/ou gradientes. Sem arquivo vetorial mestre; traçado automático alteraria a marca. Original preservado; derivado PNG remove somente branco quase puro ligado às bordas.'});
}
await fs.writeFile('public/assets/brand/manifest.json',JSON.stringify({logo:{path:'public/assets/brand/avante.svg',original:'public/assets/brand/avante-original.png',...comparison},favicon:{path:'public/assets/brand/favicon.ico',source:'https://www.avantenucleosocial.com.br/images/icons/favicon.ico',unchanged:true},partners},null,2));
await fs.writeFile('public/assets/partners/manifest.json',JSON.stringify(manifest,null,2));
console.log(comparison);console.log('Prepared',manifest.length,'partner logos');

