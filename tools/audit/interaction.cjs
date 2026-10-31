/* Browser audit. Run after `npm run build`, with the dist folder served (for example `cd dist && python3 -m http.server 4210`).
   Needs playwright and axe-core on the machine (they are not project dependencies):
     AUDIT_BASE=http://localhost:4210 AXE_PATH=/path/to/axe.min.js AUDIT_OUT=./audit node tools/audit/interaction.cjs */
const path=require('path');
function routesFromDist(){const out=[],root=path.join(__dirname,'..','..','dist');(function walk(d){for(const e of require('fs').readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(!/^(real-estate|effects)$/.test(e.name)||d!==root)walk(p);}else if(e.name==='index.html')out.push('/'+path.relative(root,path.dirname(p)).replace(/\\/g,'/')+(path.dirname(p)===root?'':'/'));}})(root);return out.sort();}
const {chromium}=require('playwright');const fs=require('fs');
const BASE=process.env.AUDIT_BASE||'http://localhost:4210';const routes=routesFromDist();
const res=[];const ok=(n,pass,note='')=>res.push({n,pass,note});
(async()=>{const b=await chromium.launch();
// 1 keyboard
{const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto(BASE+'/',{waitUntil:'load'});await p.waitForTimeout(900);
 await p.keyboard.press('Tab');const first=await p.evaluate(()=>document.activeElement.textContent.trim());ok('first Tab stop is Skip to content',/skip to content/i.test(first),first);
 await p.keyboard.press('Enter');await p.waitForTimeout(300);ok('Skip link moves focus into main',await p.evaluate(()=>document.activeElement.id==='estate-page'),await p.evaluate(()=>document.activeElement.tagName));
 const stops=[];for(let i=0;i<14;i++){await p.keyboard.press('Tab');stops.push(await p.evaluate(()=>{const e=document.activeElement;const cs=getComputedStyle(e);return {t:(e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,24),vis:cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0||cs.boxShadow!=='none'}}));}
 ok('every one of the next 14 Tab stops shows a focus ring',stops.every(s=>s.vis),stops.filter(s=>!s.vis).map(s=>s.t).join(', '));
 await p.goto(BASE+'/about/',{waitUntil:'load'});await p.waitForTimeout(600);
 await p.focus('.estate-menu-button');await p.keyboard.press('Enter');await p.waitForTimeout(700);
 ok('menu opens from the keyboard',await p.evaluate(()=>document.querySelector('dialog').open));
 const inDlg=await p.evaluate(()=>document.querySelector('dialog').contains(document.activeElement));ok('focus is inside the open menu',inDlg);
 await p.keyboard.press('Escape');await p.waitForTimeout(500);ok('Escape closes the menu',await p.evaluate(()=>!document.querySelector('dialog').open));
 ok('focus returns to the menu button',await p.evaluate(()=>document.activeElement.classList.contains('estate-menu-button')));
 await p.close();}
// 2 menu reaches every page
{const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(BASE+'/',{waitUntil:'load'});await p.waitForTimeout(700);
 await p.click('.estate-menu-button');await p.waitForTimeout(600);const hrefs=await p.evaluate(()=>[...document.querySelectorAll('dialog a')].map(a=>a.getAttribute('href')));
 ok('menu links to 11 pages and each page exists',hrefs.length>=11&&hrefs.every(h=>routes.includes(h.replace(/\/?$/,'/'))),hrefs.length+' links');await p.close();}
// 3 filters + deep link
{const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto(BASE+'/properties/?area=pauri&status=Available&sort=price-low',{waitUntil:'load'});await p.waitForTimeout(900);
 const n=await p.locator('.estate-property').count();ok('deep-linked filters apply (Pauri, available)',n===6,'cards='+n);
 const first=await p.locator('.estate-property h3').first().innerText();ok('price sort puts the cheapest per sq ft first',/Buranshi|Khirsu|Pauri|Chandrabadni/.test(first),first);await p.close();}
// 4 reduced motion
{const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(BASE+'/',{waitUntil:'load'});await p.waitForTimeout(1200);
 const y=await p.evaluate(()=>document.querySelector('.estate-stats').getBoundingClientRect().top+scrollY-200);await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(500);
 const nums=await p.evaluate(()=>[...document.querySelectorAll('[data-count]')].map(e=>e.textContent).join('/'));ok('reduced motion: stat numbers are final, not animated',nums==='25+/10+',nums);
 ok('reduced motion: hero video is paused',await p.evaluate(()=>[...document.querySelectorAll('video')].every(v=>v.paused)));ok('reduced motion: no script errors',errs.length===0,errs.join());await ctx.close();}
// 5 no JS
{const ctx=await b.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});let bad=[];
 for(const r of routes){const p=await ctx.newPage();await p.goto(BASE+r,{waitUntil:'load'});const m=await p.evaluate(()=>({h1:document.querySelectorAll('h1').length,words:document.body.innerText.split(/\s+/).length,nav:document.querySelectorAll('header nav a').length}));if(m.h1!==1||m.words<60||m.nav<4)bad.push(r+JSON.stringify(m));await p.close();}
 ok('no JavaScript: every page still has its heading, text and navigation',bad.length===0,bad.slice(0,3).join(' '));await ctx.close();}
// 6 reflow at 320px
{const ctx=await b.newContext({viewport:{width:320,height:640}});let bad=[];
 for(const r of routes){const p=await ctx.newPage();await p.goto(BASE+r,{waitUntil:'load'});await p.waitForTimeout(500);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))bad.push(r);await p.close();}
 ok('reflow: no sideways scrolling at 320px wide on any page',bad.length===0,bad.join(' '));await ctx.close();}
// 7 text zoom 200%
{const ctx=await b.newContext({viewport:{width:1280,height:800}});let bad=[];
 for(const r of ['/','/properties/','/properties/sitton-khola-5-5-nali/','/contact/','/land-valuation/','/guide/']){const p=await ctx.newPage();await p.goto(BASE+r,{waitUntil:'load'});await p.addStyleTag({content:'html{font-size:200%!important}'});await p.waitForTimeout(500);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))bad.push(r);await p.close();}
 ok('text enlarged to 200% does not break the layout sideways',bad.length===0,bad.join(' '));await ctx.close();}
// 8 slow phone
{const ctx=await b.newContext({viewport:{width:390,height:844}});const rows=[];
 for(const r of ['/','/properties/','/properties/sitton-khola-5-5-nali/','/contact/']){const p=await ctx.newPage();const c=await ctx.newCDPSession(p);
  await c.send('Network.enable');await c.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:(1.6*1024*1024)/8,uploadThroughput:(750*1024)/8});await c.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.addInitScript(()=>{window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});});
  await p.goto(BASE+r,{waitUntil:'load',timeout:60000});await p.waitForTimeout(1500);rows.push(r+' LCP '+Math.round(await p.evaluate(()=>window.__lcp))+'ms');await p.close();}
 ok('slow 4G phone (150ms, 1.6 Mbps, 4x slower CPU): largest paint under 2.5s on key pages',rows.every(x=>+x.match(/LCP (\d+)/)[1]<2500),rows.join(' ; '));await ctx.close();}
fs.writeFileSync((process.env.AUDIT_OUT||'.')+'/interaction-results.json',JSON.stringify(res,null,1));await b.close();})();
