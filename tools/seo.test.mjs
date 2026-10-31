import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const build=env=>execFileSync('node',['tools/build.mjs'],{cwd:root,env:{...process.env,...env},stdio:'pipe'});
const walk=(d,out=[])=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);f.isDirectory()?walk(p,out):out.push(p);}return out;};
const pages=()=>walk(dist).filter(f=>f.endsWith('index.html')||f.endsWith('404.html')).filter(f=>!f.includes(`${path.sep}effects${path.sep}`));
const NOINDEX=['/thank-you/'];
const route=f=>'/'+path.relative(dist,f).replace(/index\.html$/,'').replace(/\\/g,'/');
const ld=h=>[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));

test('staging build is noindex and robots blocks everything',()=>{
 build({SEO_INDEX:''});
 for(const f of pages())assert.match(fs.readFileSync(f,'utf8'),/<meta name="robots" content="noindex,nofollow">/,f);
 assert.match(fs.readFileSync(path.join(dist,'robots.txt'),'utf8'),/Disallow: \//);
});
test('production build is indexable, with a sitemap, and 404 stays noindex',()=>{
 build({SEO_INDEX:'1'});
 const robots=fs.readFileSync(path.join(dist,'robots.txt'),'utf8');assert.match(robots,/Sitemap: https:\/\/devbhoomirealtors\.com\/sitemap\.xml/);assert.ok(!/Disallow: \//.test(robots));
 for(const f of pages()){const h=fs.readFileSync(f,'utf8'),is404=f.endsWith('404.html');
  assert.equal(/content="index,follow/.test(h),!is404&&!NOINDEX.includes(route(f)),f);}
 const map=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
 const locs=[...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(locs.length,pages().length-1-NOINDEX.length);assert.equal(new Set(locs).size,locs.length);
 for(const l of locs)assert.ok(fs.existsSync(path.join(dist,new URL(l).pathname,'index.html')),l);
});
test('every page has one h1, a unique title, a description, a self canonical and valid JSON-LD',()=>{
 const titles=new Map(),descs=new Map();
 for(const f of pages()){const h=fs.readFileSync(f,'utf8'),r=route(f);
  if(f.endsWith('404.html'))continue;
  assert.equal((h.match(/<h1[ >]/g)||[]).length,1,`${r}: h1 count`);
  const title=h.match(/<title>([^<]*)<\/title>/)[1],desc=h.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(title.length>10&&title.length<=70,`${r}: title length ${title.length}`);
  assert.ok(desc.length>=60&&desc.length<=170,`${r}: description length ${desc.length}`);
  assert.ok(!titles.has(title),`${r}: duplicate title with ${titles.get(title)}`);titles.set(title,r);
  assert.ok(!descs.has(desc),`${r}: duplicate description with ${descs.get(desc)}`);descs.set(desc,r);
  assert.ok(h.includes(`<link rel="canonical" href="https://devbhoomirealtors.com${r}">`),`${r}: canonical`);
  assert.ok(h.includes('property="og:image" content="https://devbhoomirealtors.com/'),`${r}: og:image`);
  assert.ok(ld(h).some(j=>j['@type']==='RealEstateAgent'),`${r}: agent`);
  if(r!=='/')assert.ok(ld(h).some(j=>j['@type']==='BreadcrumbList'),`${r}: breadcrumbs`);
  if(r.startsWith('/properties/')&&r!=='/properties/'){const p=ld(h).find(j=>j['@type']==='Product');assert.ok(p,`${r}: product`);assert.ok(!/NaN|undefined/.test(JSON.stringify(p)));}
  assert.ok(!h.includes('file://'),`${r}: file url leaked`);
 }
});
test('every image has alt text and every internal link resolves to a built page or file',()=>{
 for(const f of pages()){const h=fs.readFileSync(f,'utf8'),r=route(f);
  for(const m of h.matchAll(/<img\b[^>]*>/g))assert.match(m[0],/ alt="/,`${r}: image without alt`);
  for(const m of h.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){const u=decodeURIComponent(m[1]),t=path.join(dist,u);
   assert.ok(fs.existsSync(t)&&(fs.statSync(t).isFile()||fs.existsSync(path.join(t,'index.html'))),`${r}: broken ${u}`);}
 }
});
test('sold listings are marked SoldOut and unpriced ones carry no invented price',()=>{
 build({SEO_INDEX:''});
 const sold=ld(fs.readFileSync(path.join(dist,'properties/khandusain-plot/index.html'),'utf8')).find(j=>j['@type']==='Product');
 assert.equal(sold.offers.availability,'https://schema.org/SoldOut');assert.ok(!('price' in sold.offers));
 const open=ld(fs.readFileSync(path.join(dist,'properties/sitton-khola-5-5-nali/index.html'),'utf8')).find(j=>j['@type']==='Product');
 assert.equal(open.offers.price,9350000);
 const enq=ld(fs.readFileSync(path.join(dist,'properties/near-devprayag-railway-station/index.html'),'utf8')).find(j=>j['@type']==='Product');
 assert.ok(!enq.offers);
});

// ---- phase 7: redirects, crawl depth, descriptions
import {content,properties} from '../site/real-estate/content.mjs';
import {routeList} from '../site/real-estate/components.mjs';
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
/** Tiny matcher for the two Vercel patterns used here: an exact path, or a path with one trailing :path* */
function redirect(url){
 const clean=url.length>1?url.replace(/\/$/,''):url;
 for(const r of vercel.redirects){
  const star=r.source.includes(':path*');
  if(!star){if(r.source===clean||r.source===url)return r.destination;continue;}
  const [pre,post]=r.source.split(':path*');
  if(clean.startsWith(pre)&&clean.endsWith(post)&&clean.length>=pre.length+post.length){
   const mid=clean.slice(pre.length,clean.length-post.length).replace(/^\//,'').replace(/\/$/,'');
   if(pre.endsWith('/')&&clean.length===pre.length-1)continue;
   return r.destination.replace(':path*',mid).replace('//','/');
  }
 }
 return null;
}
test('every old Hindi address and old file or renamed address redirects to a live English page',()=>{
 const routes=new Set(routeList(content,properties));
 for(const r of routes){if(r==='/')continue;const to=redirect(`/hi${r}`);assert.ok(to,`/hi${r} has no redirect`);assert.ok(routes.has(to.replace(/\/?$/,'/')),`/hi${r} -> ${to}`);}
 assert.equal(redirect('/hi'),'/');assert.equal(redirect('/hi/'),'/');
 assert.equal(redirect('/index.html'),'/');assert.equal(redirect('/about/index.html'),'/about/');assert.equal(redirect('/query.html'),'/contact/');
 for(const old of ['khandusain-4-5-nali-himalaya-view','buranshi-village-kot-block']){for(const pre of ['','/hi']){const to=redirect(`${pre}/properties/${old}/`);assert.ok(to&&routes.has(to),`${pre}/properties/${old}/ -> ${to}`);}}
 assert.ok(vercel.redirects.every(r=>r.permanent===true));
});
test('every page is reachable from the home page in two clicks or fewer, and none is an orphan',()=>{
 build({SEO_INDEX:''});
 const links=r=>[...new Set([...fs.readFileSync(path.join(dist,r==='/'?'index.html':`${r.slice(1)}index.html`),'utf8').matchAll(/<a [^>]*href="(\/[^"#?]*)"/g)].map(m=>m[1]).filter(h=>/\/$|^\/$/.test(h)))];
 const depth={'/':0},queue=['/'];
 while(queue.length){const r=queue.shift();for(const l of links(r)){if(!(l in depth)&&fs.existsSync(path.join(dist,l==='/'?'index.html':`${l.slice(1)}index.html`))){depth[l]=depth[r]+1;queue.push(l);}}}
 for(const r of routeList(content,properties).map(x=>x.replace(/\/?$/,'/'))){if(r==='/thank-you/')continue;assert.ok(r in depth,`${r} is an orphan`);assert.ok(depth[r]<=2,`${r} is ${depth[r]} clicks deep`);}
});
test('descriptions are 90 to 165 characters and built only from the page',()=>{
 for(const f of pages()){if(f.endsWith('404.html'))continue;const h=fs.readFileSync(f,'utf8'),d=h.match(/<meta name="description" content="([^"]*)"/)[1];assert.ok(d.length>=90&&d.length<=165,`${route(f)}: ${d.length} chars`);assert.match(d,/[.!?\u2026]$/,`${route(f)}: description ends mid-sentence`);}
});
test('sitemap dates are the latest commit date, not the build day',()=>{
 build({SEO_INDEX:'1'});const m=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8').match(/<lastmod>([^<]+)<\/lastmod>/)[1];assert.match(m,/^\d{4}-\d{2}-\d{2}$/);
 const git=execFileSync('git',['log','-1','--format=%cs'],{cwd:root,encoding:'utf8'}).trim();assert.equal(m,git);build({SEO_INDEX:''});
});
