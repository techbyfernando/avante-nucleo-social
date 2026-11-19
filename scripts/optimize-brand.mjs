import fs from 'node:fs/promises';import sharp from 'sharp';
import {optimize} from '../tools/brand-work/node_modules/svgo/lib/svgo.js';
const path='public/assets/brand/avante.svg';const original=await fs.readFile(path,'utf8');
const result=optimize(original,{multipass:true,floatPrecision:2,plugins:['preset-default']});
await fs.writeFile(path,result.data);
const rawA=await sharp(Buffer.from(original)).resize(380,80).ensureAlpha().raw().toBuffer();const rawB=await sharp(Buffer.from(result.data)).resize(380,80).ensureAlpha().raw().toBuffer();
let max=0,sum=0;for(let i=0;i<rawA.length;i++){const v=Math.abs(rawA[i]-rawB[i]);sum+=v;max=Math.max(max,v);}
let m=JSON.parse(await fs.readFile('public/assets/brand/manifest.json'));m.logo.optimization={tool:'SVGO',beforeBytes:Buffer.byteLength(original),afterBytes:Buffer.byteLength(result.data),meanChannelError:sum/rawA.length,maxChannelError:max};
await fs.writeFile('public/assets/brand/manifest.json',JSON.stringify(m,null,2));console.log(m.logo.optimization);
// Asset-mode checks from logo-design skill: actual paths, no live typography, no raster, valid canvas and colour.
const audit={svg:true,paths:(result.data.match(/<path/g)||[]).length,embeddedRaster:/<image|data:image/.test(result.data),liveText:/<text/.test(result.data),hasViewBox:/viewBox=/.test(result.data),hasFilters:/<filter/.test(result.data),colours:[...new Set(result.data.match(/#[0-9a-f]{3,8}/g))],originalFaviconUnchanged:Buffer.compare(await fs.readFile('research/avante-assets/favicon.ico'),await fs.readFile('public/assets/brand/favicon.ico'))===0};
await fs.writeFile('research/brand-validation/svg-audit.json',JSON.stringify(audit,null,2));console.log(audit);

