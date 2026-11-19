import fs from 'node:fs/promises';
import sharp from 'sharp';

const ids=['territorio','pessoas','necessidades','rede','equipes'];
await fs.mkdir('public/assets/media',{recursive:true});
for(const id of ids){
 const source=`research/generated-v4/${id}.png`;
 const metadata=await sharp(source).metadata();
 await sharp(source).resize(3840,2160,{fit:'fill',kernel:'lanczos3'}).png({compressionLevel:9}).toFile(`research/generated-v4/${id}-3840x2160.png`);
 for(const width of [480,960,1600]){
  await sharp(source).resize({width}).webp({quality:width<1000?76:81,effort:6}).toFile(`public/assets/media/v4-${id}-${width}.webp`);
  await sharp(source).resize({width}).avif({quality:width<1000?48:55,effort:5}).toFile(`public/assets/media/v4-${id}-${width}.avif`);
 }
 console.log(`${id}: source ${metadata.width}x${metadata.height}; interpolated 3840x2160 master; WebP/AVIF ready`);
}
