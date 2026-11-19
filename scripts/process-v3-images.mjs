import fs from 'node:fs/promises';
import sharp from 'sharp';

const ids=['atrio','planejamento','presenca','formacao','acesso','articulacao'];
await fs.mkdir('public/assets/media',{recursive:true});
for(const id of ids){
 const source=`research/generated-v3/${id}.png`;
 const meta=await sharp(source).metadata();
 await sharp(source).resize(3840,2160,{fit:'fill',kernel:'lanczos3'}).png({compressionLevel:9}).toFile(`research/generated-v3/${id}-3840x2160.png`);
 for(const width of [480,960,1600]){
  await sharp(source).resize({width}).webp({quality:width<1000?76:81,effort:6}).toFile(`public/assets/media/v3-${id}-${width}.webp`);
  await sharp(source).resize({width}).avif({quality:width<1000?48:55,effort:5}).toFile(`public/assets/media/v3-${id}-${width}.avif`);
 }
 console.log(`${id}: source ${meta.width}x${meta.height}; 4K master interpolated; responsive WebP/AVIF ready`);
}
