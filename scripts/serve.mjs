import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const root=path.resolve(process.env.SERVE_ROOT||'.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.json':'application/json'};
export const server=http.createServer(async(req,res)=>{
 try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';
 const file=path.resolve(root,'.'+(name.startsWith('/assets/') && !process.env.SERVE_ROOT ? '/public'+name : name));if(!file.startsWith(root+path.sep))throw Error('path');
 let bytes=await fs.readFile(file);const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
 if(/\.(html|css|js|mjs|svg|json)$/.test(file)&&req.headers['accept-encoding']?.includes('gzip')){bytes=gzipSync(bytes);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding';}
 res.writeHead(200,headers);res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Avante preview: http://127.0.0.1:${process.env.PORT||4173}`));
