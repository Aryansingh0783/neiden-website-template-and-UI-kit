import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {properties,content} from '../site/real-estate/content.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),errors=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
const files=walk(path.join(root,'site'));let modules=0;
for(const file of files.filter(x=>x.endsWith('.mjs'))){modules++;const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)errors.push(result.stderr);}
for(const image of new Set([content.hero.image,content.cottageImage,...properties.map(p=>p.image)]))if(!fs.existsSync(fileURLToPath(image)))errors.push(`Missing image: ${image}`);
const routes=['/','/properties/','/areas/','/cottages/','/services/','/about/','/guide/','/contact/','/land-valuation/','/privacy/',...properties.map(p=>`/properties/${p.slug}/`)];
const server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:'4175'},windowsHide:true,stdio:['ignore','pipe','pipe']});
const results=[];
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Server startup timed out')),5000);server.stdout.once('data',()=>{clearTimeout(timeout);resolve();});server.once('error',reject);});
 for(const route of routes){const response=await fetch('http://127.0.0.1:4175'+route);const ok=response.status===200&&(await response.text()).includes('/boot.mjs');results.push({route,ok});if(!ok)errors.push(`Route: ${route}`);}
 for(const file of files.filter(x=>!x.endsWith('.html'))){const asset='/'+path.relative(path.join(root,'site'),file).split(path.sep).map(encodeURIComponent).join('/');const response=await fetch('http://127.0.0.1:4175'+asset,{method:'HEAD'});if(response.status!==200)errors.push(`Asset: ${asset}`);}
 if((await fetch('http://127.0.0.1:4175/not-a-route/')).status!==404)errors.push('Missing route status');
 if((await fetch('http://127.0.0.1:4175/contact/',{method:'POST',body:'test'})).status!==405)errors.push('Local form submission must be disabled');
 const video=await fetch('http://127.0.0.1:4175/real-estate/assets/wave.mp4',{headers:{Range:'bytes=0-9'}});if(video.status!==206||(await video.arrayBuffer()).byteLength!==10)errors.push('Video byte-range serving');
}catch(error){errors.push(error.message);}finally{server.kill();}
const report={verifiedAt:new Date().toISOString(),modules,files:files.length,routes:results,errors,passed:errors.length===0};
fs.writeFileSync(path.join(root,'docs/verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
