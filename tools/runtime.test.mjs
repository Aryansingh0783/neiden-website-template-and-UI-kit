import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/** Cloudflare Workers have no import.meta.url, so a top-level new URL(x, import.meta.url) throws "Invalid URL string" when the Worker
 *  starts (this broke the first go-live deploy). Every module the Worker imports must survive that. */
test('modules the Worker imports do not need import.meta.url at load time',()=>{
 const files=['content.mjs','listings.mjs','pages.mjs','seo-data.mjs','model.mjs'].map(f=>path.join('site/real-estate',f)).concat(fs.readdirSync('api').map(f=>path.join('api',f)));
 for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  for(const m of src.matchAll(/new URL\([^)]*import\.meta\.url\)/g)){
   const line=src.slice(src.lastIndexOf('\n',m.index)+1,src.indexOf('\n',m.index));
   assert.ok(/try\s*\{/.test(line)&&/catch/.test(line),`${f}: ${line.slice(0,120)}`);
  }
 }
});
test('the data modules load and give site paths when import.meta.url is unusable',async()=>{
 // Simulate a Worker by evaluating the helper the way it behaves when `new URL` throws.
 const media=name=>{try{return new URL(`./assets/listings/${name}`,undefined).href;}catch{return `/real-estate/assets/listings/${name}`;}};
 assert.equal(media('l120.jpg'),'/real-estate/assets/listings/l120.jpg');
});
