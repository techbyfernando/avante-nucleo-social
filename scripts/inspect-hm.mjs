import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--remote-debugging-port=9237']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('https://hm-consultoria.vercel.app/',{waitUntil:'domcontentloaded',timeout:60000});
console.log('HM browser ready at CDP 127.0.0.1:9237');
await new Promise(resolve=>process.on('SIGINT',resolve));
await browser.close();
