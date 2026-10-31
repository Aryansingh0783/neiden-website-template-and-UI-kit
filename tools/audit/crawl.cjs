/* Browser audit. Run after `npm run build`, with the dist folder served (for example `cd dist && python3 -m http.server 4210`).
   Needs playwright and axe-core on the machine (they are not project dependencies):
     AUDIT_BASE=http://localhost:4210 AXE_PATH=/path/to/axe.min.js AUDIT_OUT=./audit node tools/audit/crawl.cjs */
const path=require('path');
function routesFromDist(){const out=[],root=path.join(__dirname,'..','..','dist');(function walk(d){for(const e of require('fs').readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(!/^(real-estate|effects)$/.test(e.name)||d!==root)walk(p);}else if(e.name==='index.html')out.push('/'+path.relative(root,path.dirname(p)).replace(/\\/g,'/')+(path.dirname(p)===root?'':'/'));}})(root);return out.sort();}
const {chromium}=require('playwright');const fs=require('fs');
const axeSrc=fs.readFileSync(process.env.AXE_PATH||require.resolve('axe-core/axe.min.js'),'utf8');
const routes=routesFromDist().concat(['/404.html']);
const BASE=process.env.AUDIT_BASE||'http://localhost:4210';
const out={pages:0,errors:[],overflow:[],axe:{},links:[],perf:[],meta:[]};
(async()=>{const b=await chromium.launch();
const known=new Set(routes.map(r=>r.replace(/\/?$/,'/')));known.add('/404.html/');
for(const [vn,w,h] of [['m',390,844],['t',768,1024],['d',1440,900]]){
 const ctx=await b.newContext({viewport:{width:w,height:h}});
 for(const r of routes){
  const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('js:'+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,100))});
  p.on('response',x=>{if(x.status()>=400&&!/404\.html$/.test(r))errs.push(x.status()+' '+x.url().replace(BASE,''))});
  p.on('requestfailed',x=>{if(!/\.mp4|google\.com\/maps|gstatic|mtalk/.test(x.url()))errs.push('failed '+x.url().replace(BASE,''))});
  await p.addInitScript(()=>{window.__cls=0;window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});});
  try{
   await p.goto(BASE+r,{waitUntil:'load',timeout:20000});await p.waitForTimeout(900);
   const m=await p.evaluate(()=>({ov:document.documentElement.scrollWidth>innerWidth+1,cls:window.__cls,lcp:window.__lcp,h1:document.querySelectorAll('h1').length,title:document.title,imgsNoAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,brokenImgs:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.loading!=='lazy').length,hrefs:[...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href').split('#')[0].split('?')[0]).filter(Boolean)}));
   out.pages++;
   if(m.ov)out.overflow.push(vn+r);
   if(m.h1!==1)out.meta.push(`${vn}${r} h1=${m.h1}`);
   if(m.imgsNoAlt)out.meta.push(`${vn}${r} images without alt: ${m.imgsNoAlt}`);
   if(m.brokenImgs)out.meta.push(`${vn}${r} broken images: ${m.brokenImgs}`);
   for(const h of m.hrefs){const n=h.replace(/\/?$/,'/');if(!known.has(n)&&!/\.(jpg|png|svg|mjs|css|woff2|mp4|xml|txt)$/.test(h))out.links.push(`${vn}${r} -> ${h}`);}
   out.perf.push([vn,r,Math.round(m.lcp),+m.cls.toFixed(3)]);
   if(vn!=='t'){await p.evaluate(src=>{const s=document.createElement('script');s.textContent=src;document.head.appendChild(s)},axeSrc);
    const res=await p.evaluate(async()=>await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}));
    for(const v of res.violations){out.axe[v.id]=out.axe[v.id]||[];out.axe[v.id].push(vn+r);}}
  }catch(e){errs.push('nav:'+e.message.slice(0,80));}
  if(errs.length)out.errors.push(vn+r+' '+[...new Set(errs)].slice(0,3).join(' | '));
  await p.close();}
 await ctx.close();}
fs.writeFileSync((process.env.AUDIT_OUT||'.')+'/crawl-results.json',JSON.stringify(out,null,1));
await b.close();})();
