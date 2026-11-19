import fs from 'node:fs/promises';
import {transform} from 'esbuild';
for(const [name,loader] of [['template.css','css'],['avante.css','css'],['refinement.css','css'],['avante.js','js'],['experience.js','js']]){
 const input=await fs.readFile(`public/assets/${name}`,'utf8');
 const {code}=await transform(input,{loader,minify:true,target:'es2022'});
 await fs.writeFile(`public/assets/${name.replace(/\.(css|js)$/,'.min.$1')}`,code);
}
const styles=await Promise.all(['template.min.css','avante.min.css','refinement.min.css'].map(name=>fs.readFile(`public/assets/${name}`,'utf8')));
await fs.writeFile('public/assets/site.min.css',styles.join('\n'));
console.log('Next assets minified.');
