import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { properties } from './site/real-estate/content.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'site');
const routes=new Set(['','properties','areas','cottages','about','services','guide','contact','land-valuation','privacy',...properties.map(p=>`properties/${p.slug}`)]);
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.mp4':'video/mp4','.json':'application/json'};
const port=Number(process.env.PORT||4173);
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('This local preview does not accept submissions.');return;}
 let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(root,'.'+route),status=200;
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){
  const slug=route.split('/').filter(Boolean).join('/');status=routes.has(slug)?200:404;file=path.join(root,'index.html');
 }
 const stat=fs.statSync(file),headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(range&&path.extname(file)==='.mp4'){
  const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;
  if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
  res.writeHead(206,{...headers,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);return;
 }
 res.writeHead(status,headers);if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Real estate template: http://127.0.0.1:${port}/`));
