import fs from 'node:fs/promises';
import {transform} from 'esbuild';
await fs.mkdir('dist',{recursive:true});
await fs.copyFile('index.html','dist/index.html');
await fs.cp('public/assets','dist/assets',{recursive:true});
await fs.rm('dist/assets/motion.js',{force:true});
for(const [file,loader] of [['template.css','css'],['avante.css','css'],['refinement.css','css'],['experience.js','js'],['avante.js','js']]){
 const input=await fs.readFile('public/assets/'+file,'utf8');
 const result=await transform(input,{loader,minify:true,target:'es2022',legalComments:'eof'});
 await fs.writeFile('dist/assets/'+file,result.code);
}
for(const file of ['LICENSE','CREDITS.md'])await fs.copyFile(file,'dist/'+file);
console.log('Static production build ready in dist/');
