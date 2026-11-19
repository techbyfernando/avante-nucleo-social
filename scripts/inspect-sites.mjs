import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('https://www.avantenucleosocial.com.br/',{waitUntil:'domcontentloaded'});
await page.waitForTimeout(2000);
for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(120);}
await page.screenshot({path:'research/avante-original-desktop.png',fullPage:true});
await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'research/avante-original-hero.png'});
const files=(await fs.readdir('research/avante-assets')).filter(x=>/\.(png|jpg)$/.test(x));
const tiles=await Promise.all(files.map(async(name,i)=>({input:await sharp('research/avante-assets/'+name).resize(220,150,{fit:'contain',background:'#0a4049'}).png().toBuffer(),left:i%5*240,top:Math.floor(i/5)*180})));
await sharp({create:{width:1200,height:Math.ceil(files.length/5)*180,channels:3,background:'#e8f1f2'}}).composite(tiles).png().toFile('research/avante-assets-montage.png');
await fs.writeFile('research/avante-assets-order.json',JSON.stringify(files,null,2));
await browser.close();
