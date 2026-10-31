import { selectProperties, ratePerSqft, whatsappURL } from './model.mjs';
import { pages } from './pages.mjs';
export const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escape, num=value=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(value);
const whole=value=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(value);
export const action=(label,href,external=false)=>`<a class="estate-action" href="${e(href)}"${external?' target="_blank" rel="noopener"':''}><span>${e(label)}</span><span aria-hidden="true">↗</span></a>`;
const wa=(c,text)=>whatsappURL(c.contact.whatsappNumber,text||c.contact.greeting);
const unitName=u=>u==='sqm'?'sq m':u;
const sizeLine=(p,c)=>p.size==null||!Number.isFinite(p.size)?'Size on enquiry':`${num(p.size)} ${unitName(p.unit)}`;
const kicker=(n,label)=>`<p class="estate-kicker"><span>[</span><i>${n}</i><span>${e(label)}</span><span>]</span></p>`;
const title=(heading,detail='')=>`<div class="estate-section-title"><h2 data-motion-reveal>${e(heading)}</h2>${detail?`<p>${e(detail)}</p>`:''}</div>`;
const pageTitle=(label,heading,detail='')=>`<section class="estate-section estate-page-heading">${label?kicker('↗',label):''}<h1 data-motion-reveal>${e(heading)}</h1>${detail?`<p class="estate-lead">${e(detail)}</p>`:''}</section>`;
const areaName=(c,id)=>c.areas.find(a=>a.id===id)?.name||id;
const sqftOf=(p,c)=>{const v=p.size*c.units[p.unit];return Number.isFinite(v)?v:null};
const perSqft=(p,c)=>{const v=ratePerSqft(p,c.units);return Number.isFinite(v)?v:null};
const sqftText=(p,c)=>sqftOf(p,c)===null?'Size to confirm':`${num(sqftOf(p,c))} sq ft`;
const price=p=>p.priceLabel||(p.status==='Sold'?'Sold':!Number.isFinite(p.rate)?'On enquiry':`₹${num(p.rate)}${p.rateUnit==='total'?'':` / ${p.rateUnit}`}`);
const lakh=n=>n>=1e7?`₹${+(n/1e7).toFixed(2)} crore`:`₹${+(n/1e5).toFixed(2)} lakh`;
const accessText=p=>p.access==='Ask us'?'Ask about access':p.access;
const phoneHref=n=>`tel:+91${String(n).replace(/\D/g,'')}`;
export function propertyCard(p,c,href) {
 const rate=perSqft(p,c);
 return `<article class="estate-property${p.status==='Sold'?' estate-property--sold':''}"><a class="estate-project" href="${href(`/properties/${p.slug}/`)}"><div class="estate-project-image" data-motion-reveal><img src="${e(p.image)}" alt="${e(p.name)}" width="1200" height="900" loading="lazy"><span class="estate-badge">${e(p.status)}</span>${p.hasVideo?'<span class="estate-badge estate-badge--video">Video</span>':''}</div><div class="estate-project-label"><div><p>${e(areaName(c,p.area))} / ${e(p.place||p.type)}</p><h3>${e(p.name)}</h3></div><span aria-hidden="true">↗</span></div></a><div class="estate-facts"><span>${e(sizeLine(p,c))}<small>${p.size==null?'Ask for the size':sqftText(p,c)}</small></span><span>${e(accessText(p))}<small>${e(p.view)}</small></span><span>${e(price(p))}<small>${rate!==null&&p.status!=='Sold'?`₹${whole(rate)} / sq ft`:'Ask for details'}</small></span></div></article>`;
}
export function converter(c) {
 return `<section class="estate-section estate-converter"><div><p class="estate-meta">A little clarity</p><h2 data-motion-reveal>Same land.<br>Different units.</h2><p>Compare nali, gaj, square feet and square metres.</p></div><div class="estate-converter-fields">${Object.entries(c.units).map(([unit,factor])=>`<label>${({nali:'Nali',gaj:'Gaj',sqft:'Square feet',sqm:'Square metres'})[unit]}<input type="number" min="0" step="any" inputmode="decimal" data-unit="${unit}" value="${Number((c.units.nali/factor).toFixed(4))}"></label>`).join('')}<p>Using 1 nali = ${num(c.units.nali)} sq ft. Confirm the local measurement convention for the land.</p></div></section>`;
}
function services(c,href){
 const h=c.servicesHeading;
 return `<section class="estate-section estate-services">${kicker('03',h.label)}<div class="estate-service-layout"><h2 data-motion-reveal>${e(h.heading)}</h2><div><p class="estate-lead estate-services-lead">${e(h.detail)}</p>${c.services.map((s,i)=>`<details class="estate-service" ${i===0?'open':''}><summary>${e(s.title)}</summary><div><p>${e(s.body)}</p><a class="estate-text-link" href="${e(wa(c))}" target="_blank" rel="noopener">${e(s.cta)} ↗</a></div></details>`).join('')}</div></div></section>`;
}
function process(c){
 const h=c.processHeading;
 return `<section class="estate-section estate-process">${kicker('04',h.label)}${title(h.heading,h.detail)}<div class="estate-process-grid" data-motion-reveal data-motion-stagger>${c.steps.map((step,i)=>`<article><span class="estate-meta">0${i+1} /</span><h3>${e(step.name)}</h3><dl><dt>You</dt><dd>${e(step.you)}</dd><dt>We</dt><dd>${e(step.we)}</dd></dl></article>`).join('')}</div></section>`;
}
function areas(c,href){
 const b=c.belt;
 return `<section class="estate-section estate-areas">${kicker('02',b.label)}${title(b.heading,b.body)}<div class="estate-area-list">${c.areas.map((a,i)=>`<a href="${a.href?href(a.href):href('/properties/')+'?area='+encodeURIComponent(a.id)}"><span class="estate-meta">0${i+1}</span><h3>${e(a.name)}</h3><span>${e(a.line)}</span><b aria-hidden="true">↗</b></a>`).join('')}</div></section>`;
}
function faq(c){
 const h=c.faqHeading;
 return `<section class="estate-section estate-faq">${kicker('06',h.label)}<div class="estate-service-layout"><h2 data-motion-reveal>${e(h.heading)}</h2><div>${c.faqs.map(([q,a])=>`<details class="estate-service"><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</div></div></section>`;
}
function outside(c,href){
 const o=c.outside;
 const list=items=>`<ul>${items.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`;
 return `<section class="estate-section estate-outside">${kicker('05',o.label)}<h2 data-motion-reveal>${e(o.heading)}</h2><div class="estate-outside-grid"><div><h3>What you can do</h3>${list(o.can)}</div><div><h3>What you cannot do</h3>${list(o.cannot)}</div></div><div class="estate-outside-foot"><p class="estate-small">${e(o.note)}</p>${action(o.cta,href('/guide/'))}</div></section>`;
}
function founder(c,href){
 const f=c.founder;
 return `<section class="estate-section estate-founder"><figure><img src="${e(f.image)}" alt="${e(f.caption)}" width="676" height="900" loading="lazy"><figcaption>${e(f.caption)}</figcaption></figure><div>${kicker('↗',f.label)}<h2 data-motion-reveal>${e(f.heading)}</h2>${f.body.map(t=>`<p>${e(t)}</p>`).join('')}<div class="estate-founder-actions">${action(f.cta,href('/about/'))}<a class="estate-text-link" href="tel:${e(c.contact.telephone)}">${e(c.office.phones[0])} ↗</a></div></div></section>`;
}
function stats(c){return `<section class="estate-stats" aria-label="Devbhoomi Realtors at a glance">${c.stats.map(s=>`<div><p class="estate-stat-value">${e(s.value)}</p>${s.label?`<p class="estate-stat-label">${e(s.label)}</p>`:''}${s.note?`<p class="estate-stat-note">${e(s.note)}</p>`:''}</div>`).join('')}</section>`;}
function close(c,href,n='07'){
 const k=c.closing;
 return `<section class="estate-section estate-closing">${kicker(n,k.label)}<h2 data-motion-reveal>${e(k.heading)}</h2><div class="estate-dual-cta"><div><p class="estate-meta">${e(k.buyer.tag)}</p><h3>${e(k.buyer.title)}</h3><p>${e(k.buyer.body)}</p>${action(k.buyer.cta,wa(c),true)}<a class="estate-text-link" href="${href('/properties/')}">${e(k.buyer.ctaSecondary)} ↗</a></div><div><p class="estate-meta">${e(k.seller.tag)}</p><h3>${e(k.seller.title)}</h3><p>${e(k.seller.body)}</p>${action(k.seller.cta,href('/land-valuation/'))}</div></div><p class="estate-closing-note">${e(k.note)}</p></section>`;
}
function cottage(c,href){
 const t=c.cottage;
 return `<section class="estate-cottage"><img src="${e(c.cottageImage)}" alt="A-frame cottage under a shingle roof, in deodar forest" loading="lazy" width="1800" height="1200"><div>${kicker('↗',t.label)}<h2 data-motion-reveal>${e(t.heading)}</h2><p>${e(t.body)}</p>${action(t.cta,href('/cottages/'))}</div></section>`;
}
export function home(c,properties,href){
 const hero=c.hero,intro=c.intro,a=c.available;
 const featured=a.featured.map(slug=>properties.find(p=>p.slug===slug)).filter(Boolean);
 const quick=c.quicklinks.map(q=>q.whatsapp?`<a href="${e(wa(c))}" target="_blank" rel="noopener">${e(q.label)} ↗</a>`:`<a href="${href(q.href)}">${e(q.label)} ↗</a>`).join('');
 return `<section class="estate-hero estate-grid" aria-label="Introduction"><img class="estate-hero-media" src="${e(hero.image)}" alt="" fetchpriority="high">${hero.video?`<video autoplay muted loop playsinline preload="metadata" aria-hidden="true" poster="${e(hero.image)}"><source src="${e(hero.video)}" type="video/mp4"></video>`:''}<div class="estate-hero-top"><span class="estate-status">${e(hero.eyebrow)}</span><span>${e(hero.side)}</span></div><div class="estate-disciplines">${c.disciplines.map((d,i)=>`<div><span>0${i+1}.</span><p>${e(d)}</p></div>`).join('')}</div><h1 class="estate-hero-title"><span class="estate-wordmark" data-motion-reveal>${e(hero.heading)}</span> <span class="estate-hand" data-motion-reveal>${e(hero.handwritten)}</span></h1><div class="estate-hero-bottom"><span class="estate-meta">${e(c.office.hours)}<br>WhatsApp anytime</span><p>${e(hero.description)}</p><div class="estate-hero-actions">${action(hero.cta,wa(c),true)}<a class="estate-text-link" href="${href('/properties/')}">${e(hero.ctaSecondary)} ↗</a></div></div><a class="estate-scroll-cue" href="#selected">Scroll to explore ↓</a></section>
<section class="estate-quicklinks" aria-label="Quick actions">${quick}</section>
<section class="estate-section estate-intro estate-section-grid">${kicker('01',c.brand)}<h2 data-motion-reveal>${e(intro.heading)}</h2><div class="estate-intro-bottom"><p>${e(intro.lead)} ${e(intro.body)}</p><a class="estate-text-link" href="${href('/about/')}">More about us ↗</a></div></section>
${stats(c)}
<section class="estate-section" id="selected">${kicker('↗',a.label)}${title(a.heading,a.detail)}<div class="estate-project-grid estate-project-grid--three">${featured.map(p=>propertyCard(p,c,href)).join('')}</div><div class="estate-section-end">${action('See all available land',href('/properties/'))}</div></section>${areas(c,href)}${cottage(c,href)}${services(c,href)}${process(c)}${outside(c,href)}${founder(c,href)}${faq(c)}${converter(c)}${close(c,href)}`;
}
const options=(items,current,all)=>`<option value="">${e(all)}</option>${items.map(([value,label])=>`<option value="${e(value)}" ${current===value?'selected':''}>${e(label)}</option>`).join('')}`;
export function listing(c,properties,href,search){
 const f=Object.fromEntries(new URLSearchParams(search)),selected=selectProperties(properties,f,c.units);
 return `${pageTitle('Available land','Land and plots available.','Every plot on our books right now, from Rishikesh through the Devprayag-Pauri belt to Pauri Garhwal. Size, price and road access on each one, and the papers checked before you visit.')}<section class="estate-section estate-listings"><form class="estate-filters" data-property-filters role="search"><label>Search<input name="q" type="search" value="${e(f.q||'')}" placeholder="Name or reference"></label><label>Area<select name="area">${options(c.areas.map(a=>[a.id,a.name]),f.area,'All areas')}</select></label><label>Access<select name="access">${options([...new Set(properties.map(p=>p.access))].map(x=>[x,x==='Ask us'?'Ask about access':x]),f.access,'All roads')}</select></label><label>Status<select name="status">${options(['Available','Sold'].map(x=>[x,x]),f.status,'All statuses')}</select></label><label>Type<select name="type">${options([...new Set(properties.map(p=>p.type))].map(x=>[x,x]),f.type,'All types')}</select></label><button class="estate-filter-submit" type="submit">Apply filters ↗</button></form><div class="estate-results-bar"><p role="status" aria-live="polite" data-result-count>${selected.length} ${selected.length===1?'property':'properties'}</p><button type="button" data-clear-filters>Clear filters</button><label>Sort <select name="sort" form="unused" data-sort>${[['','Featured'],['price-low','Price / sq ft: low to high'],['price-high','Price / sq ft: high to low'],['size','Largest area']].map(([value,label])=>`<option value="${value}" ${f.sort===value?'selected':''}>${label}</option>`).join('')}</select></label></div><p class="estate-small">Available land comes first. Sorting by price compares rates per square foot across nali and gaj, and puts plots priced on enquiry last.</p><div class="estate-project-grid" data-property-results>${selected.map(p=>propertyCard(p,c,href)).join('')}</div><div class="estate-empty" data-empty ${selected.length?'hidden':''}><h2>No matching properties.</h2><p>Try another area or remove a filter.</p><button type="button" data-clear-filters>Clear all filters</button></div></section>${converter(c)}${close(c,href)}`;
}
function detailMedia(p,c){
 const vids=p.videos||[];
 const photos=(p.images||[]).filter(i=>i!==p.poster);
 const shots=photos.length?photos:(vids.length?[]:[p.image]);
 const video=vids.length?`<figure class="estate-detail-video"><video controls playsinline preload="metadata"${p.poster?` poster="${e(p.poster)}"`:''}><source src="${e(vids[0])}" type="video/mp4">Your browser cannot play this video.</video><figcaption>Video of the plot. Press play.</figcaption></figure>`:'';
 const stills=shots.map((src,i)=>`<figure class="estate-detail-image"><img src="${e(src)}" alt="${e(p.name)}${shots.length>1?`, photo ${i+1}`:''}" width="1800" height="1200"${i||video?' loading="lazy"':''}>${i===0&&!video?`<figcaption>${e(p.name)}</figcaption>`:''}</figure>`).join('');
 const glance=video&&!stills?`<dl class="estate-glance">${[['Size',p.size==null?'On enquiry':sizeLine(p,c)],['Price',price(p)],['Road access',accessText(p)],['View',p.view]].map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl>`:'';
 return `<div class="estate-detail-media${video&&stills?' estate-detail-media--pair':glance?' estate-detail-media--solo':''}">${video}${stills}${glance}</div>`;
}
function related(p,c,properties,href){
 const open=properties.filter(x=>x.slug!==p.slug&&x.status==='Available');
 const near=open.filter(x=>x.area===p.area),list=(near.length?near:open).slice(0,3);
 if(!list.length)return '';
 return `<section class="estate-section">${title(near.length?`More in ${areaName(c,p.area)}.`:'Other land available.')}<div class="estate-project-grid estate-project-grid--three">${list.map(x=>propertyCard(x,c,href)).join('')}</div></section>`;
}
export function propertyDetail(p,c,href,properties=[]){
 const sold=p.status==='Sold',body=p.body&&p.body.length?p.body:[p.summary||p.description].filter(Boolean);
 const msg=sold?`Hello, I saw that ${p.name} (${p.id}) has been sold. Do you have something similar available?`:null;
 const wsp=sold?wa(c,msg):(p.whatsapp||wa(c,`Hello, I am interested in this property: ${p.name} (${p.id})`));
 const phone=c.office.phones[0];
 const rows=[['Location',p.place],['Area',areaName(c,p.area)],['Size',p.size==null?'Size on enquiry':`${sizeLine(p,c)} / ${sqftText(p,c)}`],['Road access',accessText(p)],['View',p.view],['Aspect',p.aspect],['Papers',p.documents],['Status',p.status]];
 return `${pageTitle(`${areaName(c,p.area)} / ${p.type}`,p.name,`${p.id} / ${p.status}`)}${detailMedia(p,c)}<section class="estate-section estate-detail"><div><p class="estate-meta">The details</p><h2 data-motion-reveal>About this property</h2><p class="estate-lead">${e(body[0])}</p>${body.slice(1).map(t=>`<p class="estate-detail-copy">${e(t)}</p>`).join('')}${p.highlights&&p.highlights.length?`<h3 class="estate-detail-sub">What it has</h3><ul class="estate-highlights">${p.highlights.map(h=>`<li>${e(h)}</li>`).join('')}</ul>`:''}<dl>${rows.map(([key,value])=>`<div><dt>${e(key)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl></div><aside><p class="estate-meta">${sold?'Sold':'Price'}</p><h3>${e(price(p))}</h3>${!sold&&perSqft(p,c)!==null?`<p>₹${whole(perSqft(p,c))} per sq ft${p.total?`<br>${e(lakh(p.total))} for the parcel`:''}</p>`:''}<p>${sold?'This one has been sold. Ask us what is available now.':'Message us on WhatsApp for the exact location, the papers and a visit. We reply fastest there.'}</p>${action(sold?'Ask about similar land':'WhatsApp about this',wsp,true)}<p class="estate-aside-links"><a class="estate-text-link" href="${phoneHref(phone)}">Call ${e(phone)}</a><a class="estate-text-link" href="${href('/contact/')}?property=${encodeURIComponent(p.id)}">Send details by form</a><a class="estate-text-link" href="${href('/properties/')}">← All properties</a></p></aside></section>${related(p,c,properties,href)}${converter(c)}`;
}
/* ---------- Phase 3: the other pages, rendered from the live site's own words (pages.mjs) ---------- */
const isExt=h=>/^(https?:|tel:|mailto:)/.test(h);
const isWeb=h=>/^https?:/.test(h);
const slug=t=>String(t).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const goto=(h,href)=>isExt(h)||h.startsWith('#')?h:href(h);
const imgTag=(b,lazy=true)=>`<img src="${e(b.src)}" alt="${e(b.alt)}"${b.w?` width="${b.w}" height="${b.h}"`:''}${lazy?' loading="lazy"':''}>`;
function block(b,c,href){
 switch(b.t){
  case 'p': return `<p>${e(b.x)}</p>`;
  case 'h': return `<h4 class="estate-sub">${e(b.x)}</h4>`;
  case 'ul': return `<ul class="estate-list">${b.items.map(i=>`<li>${e(i)}</li>`).join('')}</ul>`;
  case 'cards': return `<div class="estate-cards">${b.items.map(i=>`<div><h3>${e(i.title)}</h3><p>${e(i.x)}</p></div>`).join('')}</div>`;
  case 'table': return `<table class="estate-table"><thead><tr>${b.head.map(x=>`<th scope="col">${e(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map((x,i)=>i?`<td>${e(x)}</td>`:`<th scope="row">${e(x)}</th>`).join('')}</tr>`).join('')}</tbody></table>`;
  case 'callout': return `<aside class="estate-callout"><strong>${e(b.title)}</strong><p>${e(b.x)}</p></aside>`;
  case 'img': return `<figure class="estate-figure">${imgTag(b)}</figure>`;
  case 'gallery': return `<div class="estate-gallery">${b.items.map(i=>`<figure>${imgTag(i)}<figcaption>${e(i.alt)}</figcaption></figure>`).join('')}</div>`;
  case 'video': return `<figure class="estate-figure estate-figure--video"><video controls playsinline preload="metadata"${b.poster?` poster="${e(b.poster)}"`:''}><source src="${e(b.src)}" type="video/mp4"></video></figure>`;
  case 'stats': return `<div class="estate-stats-row">${b.items.map(i=>`<div><p class="estate-stat-value">${e(i.v)}</p><p class="estate-stat-label">${e(i.u)}</p><p class="estate-stat-note">${e(i.n)}</p></div>`).join('')}</div><p class="estate-suited"><span>${e(b.suited.label)}</span>${b.suited.items.map(i=>`<b>${e(i)}</b>`).join('')}</p>`;
  case 'cta': return `<p class="estate-cta">${action(b.x,goto(b.href,href),isWeb(b.href))}</p>`;
  case 'quote': return `<blockquote>${e(b.x)}</blockquote>`;
  default: return '';
 }
}
function sections(blocks){
 const out=[{h:null,blocks:[]}];
 for(const b of blocks){if(b.t==='h'&&(b.l===2||b.l===3))out.push({h:b,blocks:[]});else out[out.length-1].blocks.push(b);}
 return out;
}
function article(route,c,href,{skip=[],toc=false,tail='',inject={}}={}){
 const pg=pages[route],all=sections(pg.blocks).filter(s=>!(s.h&&skip.includes(s.h.x)));
 const intro=all[0],rest=all.slice(1);
 return `${pageTitle(pg.kicker||'',pg.h1,pg.lead)}${pg.reviewed?`<p class="estate-reviewed">${e(pg.reviewed)}</p>`:''}${intro.blocks.length?`<section class="estate-section estate-article-intro">${intro.blocks.map(b=>block(b,c,href)).join('')}</section>`:''}${toc&&rest.length?`<nav class="estate-toc" aria-label="On this page"><p class="estate-meta">On this page</p>${rest.filter(s=>s.h.l===2||!rest.some(x=>x.h.l===2)).map(s=>`<a href="#${slug(s.h.x)}">${e(s.h.x)}</a>`).join('')}</nav>`:''}${rest.map(s=>`<section class="estate-section estate-article-section" id="${slug(s.h.x)}"><${s.h.l===2?'h2':'h3'} class="estate-article-heading" data-motion-reveal>${e(s.h.x)}</${s.h.l===2?'h2':'h3'}><div class="estate-article-body">${inject[s.h.x]!==undefined?inject[s.h.x]:s.blocks.map(b=>block(b,c,href)).join('')}</div></section>`).join('')}${tail}`;
}
const areaSlug={devprayag:'/areas/devprayag/',kholachauri:'/areas/kholachauri-corridor/',pauri:'/areas/pauri-garhwal/'};
function areaPage(route,c,href,properties){
 const id=Object.keys(areaSlug).find(k=>areaSlug[k]===route),list=properties.filter(p=>p.area===id&&p.status==='Available');
 const tail=`<section class="estate-section">${title('Land available here.')}${list.length?`<div class="estate-project-grid estate-project-grid--three">${list.map(p=>propertyCard(p,c,href)).join('')}</div>`:`<p class="estate-lead">Nothing listed here right now. Tell us what you are looking for.</p>`}</section>`;
 const ask=`<p class="estate-cta">${action('WhatsApp us',wa(c,`Hello, I would like to ask about land in ${areaName(c,id)}\n(sent from your website)`),true)}<a class="estate-text-link" href="tel:+91${c.office.phones[0].replace(/\D/g,'')}">${e(c.office.phones[0])}</a></p><p>${e(c.office.hours)}</p>`;
 return article(route,c,href,{tail,inject:{'Ask about this area':ask}})+close(c,href,'↗');
}
function areasIndex(c,href){
 const pg=pages['/areas/'],cards=pg.blocks.find(b=>b.t==='areacards').items;
 return `${pageTitle(pg.kicker,pg.h1,pg.lead)}<section class="estate-section"><div class="estate-areacards">${cards.map((a,i)=>`<article><p class="estate-areacard-alt" aria-label="Altitude">${e(a.altitude)}</p><h3>${e(a.name)}</h3><p class="estate-meta">${e(a.district)}</p><p>${e(a.line)}</p>${a.cta?`<a class="estate-text-link" href="${href(a.cta.href)}">${e(a.cta.x)} ↗</a>`:''}</article>`).join('')}</div><p class="estate-small">${e(c.office.coverage)}</p></section>${close(c,href,'↗')}`;
}
function testimonialsPage(c,href){
 const pg=pages['/testimonials/'];
 return `${pageTitle(pg.kicker,pg.h1,pg.lead)}<section class="estate-section"><div class="estate-quotes">${pg.quotes.map(q=>`<figure><blockquote>${e(q.quote)}</blockquote><figcaption><b>${e(q.name)}</b><span>${e(q.place)}</span></figcaption></figure>`).join('')}</div>${pg.blocks.map(b=>block(b,c,href)).join('')}</section>${close(c,href,'↗')}`;
}
function updatesIndex(c,href){
 const pg=pages['/updates/'],img=pg.blocks.find(b=>b.t==='img'),date=pg.blocks.find(b=>b.t==='p'),head=pg.blocks.find(b=>b.t==='h'),sum=pg.blocks.filter(b=>b.t==='p')[1],more=pg.blocks.filter(b=>b.t==='p')[2],u='/updates/devprayag-railway-station/';
 return `${pageTitle(pg.kicker,pg.h1,pg.lead)}<section class="estate-section"><article class="estate-update"><a href="${href(u)}">${imgTag(img)}</a><div><p class="estate-meta">${e(date.x)}</p><h2><a href="${href(u)}">${e(head.x)}</a></h2><p>${e(sum.x)}</p><a class="estate-text-link" href="${href(u)}">Read the update ↗</a></div></article><p class="estate-small">${e(more.x)}</p></section>`;
}
function contactPage(c,href,search){
 const pg=pages['/contact/'],o=c.office,here=pg.blocks.filter(b=>b.t==='p'),office=here.find(b=>/^Kholachauri village, on the/.test(b.x)),sell=pg.blocks.find(b=>b.t==='h'&&b.x==='Selling land?'),sellText=here.find(b=>/realistic range/.test(b.x));
 return `${pageTitle(pg.kicker,pg.h1,pg.lead)}<section class="estate-section estate-contact"><div><h2 class="estate-article-heading">Reach us directly</h2>${action('WhatsApp us, '+o.phones[0],wa(c,'Hello, I found your website and would like to ask about land on the Devprayag–Pauri belt.\n(sent from your website)'),true)}<ul class="estate-people">${o.phones.map((ph,i)=>`<li><a href="tel:+91${ph.replace(/\D/g,'')}">${e(ph)}</a><span>${e(o.phoneNames[i])}</span></li>`).join('')}</ul><p class="estate-small">${e(o.hours)} · WhatsApp anytime<br>We reply within 24 hours</p></div><div><h2 class="estate-article-heading">Where we are</h2><address>${e(o.address)}</address><p>${o.emails.map(m=>`<a href="mailto:${e(m)}">${e(m)}</a>`).join('<br>')}</p><p><a class="estate-text-link" href="${e(o.mapUrl)}" target="_blank" rel="noopener">Open in Google Maps ↗</a></p><p class="estate-small">${e(o.coverage)}</p>${office?`<p>${e(office.x)}</p>`:''}</div></section>${enquiryForm(c,href,search,false)}<section class="estate-section estate-sell-note"><h3>${e(sell.x)}</h3><p>${e(sellText.x)}</p>${action('Ask what your land is worth',href('/land-valuation/'))}</section>${converter(c)}`;
}
function referralPage(c,href){
 const pg=pages['/referral/'],tiers=pg.blocks.find(b=>b.t==='tiers'),rest=pg.blocks.filter(b=>b.t!=='tiers'),all=sections(rest).slice(1);
 return `${pageTitle(pg.kicker,pg.h1,pg.lead)}<section class="estate-section"><ol class="estate-tiers">${tiers.items.map(t=>`<li><p class="estate-meta">Tier ${t.n}</p><h3>${e(t.title)}</h3><p>${e(t.x)}</p><p class="estate-tier-note">${e(t.note)}</p></li>`).join('')}</ol></section>${all.map(s=>`<section class="estate-section estate-article-section"><${s.h.l===2?'h2':'h3'} class="estate-article-heading">${e(s.h.x)}</${s.h.l===2?'h2':'h3'}><div class="estate-article-body">${s.blocks.map(b=>block(b,c,href)).join('')}${s.h.x==='Send us their name'?`<p class="estate-cta">${action('Open WhatsApp',wa(c,'Hello, I would like to refer a friend for a site visit.\n(sent from your website)'),true)}</p>`:''}</div></section>`).join('')}`;
}
function thanksPage(c,href){
 const pg=pages['/thank-you/'];
 return `${pageTitle('',pg.h1,pg.lead)}<section class="estate-section estate-article-intro">${pg.blocks.map(b=>block(b,c,href)).join('')}<p class="estate-cta">${action('WhatsApp us',wa(c,'Hello, I want to know what my land is worth. Details:\n(sent from your website)'),true)}<a class="estate-text-link" href="${href('/')}">Back to home</a></p></section>`;
}
function cottagesPage(c,href){
 return article('/cottages/',c,href,{tail:`<section class="estate-section estate-article-intro"><p class="estate-cta">${action('Discuss a cottage project',wa(c,'Hello, I want to talk about a turnkey cottage project.\n(sent from your website)'),true)}<a class="estate-text-link" href="tel:+91${c.office.phones[0].replace(/\D/g,'')}">${e(c.office.phones[0])}</a></p></section>`});
}
export const routeList=(c,properties)=>[...new Set(['/','/properties/',...properties.map(p=>`/properties/${p.slug}/`),...[...c.navigation,...c.secondaryNavigation].map(n=>n.href),...Object.keys(pages)])];

export function enquiryForm(c,href,search,seller=false){
 const params=new URLSearchParams(search),intent=seller?'seller':params.get('intent')==='cottage'?'cottage':'buyer';
 return `<section class="estate-section estate-enquiry"><div><h2 data-motion-reveal>${seller?'Tell us about<br>your land.':'Send us<br>a message.'}</h2><p>${seller?'Share the details and a person will come back with a realistic range.':'Tell us what you are looking for. We will reply on WhatsApp or by phone.'}</p><p>Prefer WhatsApp? ${action(seller?'Send the details on WhatsApp':'Message us on WhatsApp',wa(c,seller?'Hello, I want to know what my land is worth. Details:\n(sent from your website)':undefined),true)}</p><p class="estate-meta">${e(c.office.hours)}</p></div><form data-enquiry><input type="hidden" name="intent" value="${intent}"><input type="hidden" name="property_id" value="${e(params.get('property')||'')}"><div class="estate-form-grid"><label>Your name<input name="name" autocomplete="name" required maxlength="100"></label><label>Phone number<input name="phone" type="tel" autocomplete="tel" required pattern="[+0-9 \\(\\)\\-]{7,20}" maxlength="20"></label>${seller?`<label>Village or location<input name="location" required maxlength="160"></label><label>Land size<input name="size" type="number" min="0.01" step="any" required></label><label>Unit<select name="unit">${['nali','gaj','sqft','sqm'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Property type<select name="property_type" required>${options(['Land','Cottage','Commercial','Other'].map(x=>[x,x]),'','Choose a type')}</select></label><label>Road access<select name="access" required>${options(['Highway-touch','Road-touch','Branch road','To confirm'].map(x=>[x,x]),'','Choose access')}</select></label><label>Document status<select name="documents" required>${options(['Available for review','In progress','To discuss'].map(x=>[x,x]),'','Choose status')}</select></label><label class="estate-wide">Price in mind (optional)<input name="expected_price" maxlength="80"></label>`:`<label>Interested in<select name="interest"><option>Buying land</option><option ${intent==='cottage'?'selected':''}>Cottage project</option><option>Site visit</option><option>Video walk-through</option></select></label><label>Preferred area<select name="area">${options(c.areas.map(a=>[a.id,a.name]),'','Let’s discuss')}</select></label><label class="estate-wide">Budget in mind (optional)<input name="budget" maxlength="80" placeholder="A rough range is helpful"></label>`}<label class="estate-wide">Anything else you would like to add<textarea name="message" rows="4" maxlength="2000"></textarea></label></div><button class="estate-action" type="submit"><span>Prepare enquiry</span><span aria-hidden="true">↗</span></button><p class="estate-small">Local preview. Your details are not stored or transmitted.</p><div data-enquiry-feedback role="status" aria-live="polite"></div></form></section>`;
}
export function enquiry(c,href,search,seller=false){
 const pg=pages[seller?'/land-valuation/':'/contact/'];
 return `${pageTitle(pg.kicker,pg.h1,pg.lead)}${enquiryForm(c,href,search,seller)}`;
}
export function shell(content,href,main='',route=''){
 const nav=items=>items.map(n=>`<a href="${href(n.href)}">${escape(n.label)}</a>`).join('');
 return `<a href="#estate-page" class="estate-skip">Skip to content</a><header class="estate-shell estate-header"><a class="estate-brand" href="${href('/')}" aria-label="${escape(content.brand)} home">${escape(content.brandShort)}</a><nav aria-label="Primary">${nav(content.navigation)}</nav><button class="estate-menu-button" aria-label="Open menu" aria-controls="estate-menu" aria-expanded="false"></button></header><dialog class="estate-shell estate-menu" id="estate-menu" aria-label="Navigation" data-motion-native><div class="estate-menu-inner"><div class="estate-menu-top"><a class="estate-brand" href="${href('/')}" aria-label="${escape(content.brand)} home">${escape(content.brandShort)}</a><button class="estate-close" aria-label="Close menu">×</button></div><div class="estate-menu-columns"><nav aria-label="Expanded navigation">${nav(content.navigation)}</nav><nav class="estate-secondary-menu" aria-label="More pages">${nav(content.secondaryNavigation)}</nav></div><div class="estate-menu-bottom estate-meta"><span>Rishikesh / Devprayag / Kholachauri / Pauri</span><span>${escape(content.office.hours)}</span></div></div></dialog><main class="estate-shell estate-page" id="estate-page" tabindex="-1"${route?` data-route="${e(route)}" data-prerendered`:''}>${main}</main><div class="estate-shell estate-footer-wrap">${footer(content,href)}</div>`;
}
export function footer(c,href){
 const o=c.office,all=[...c.navigation,...c.secondaryNavigation];
 return `<footer class="estate-footer"><div class="estate-footer-top"><div class="estate-footer-office"><p class="estate-meta">${e(c.brand)}</p><p class="estate-footer-descriptor">${e(o.descriptor)}</p><address>${e(o.address)}</address><p class="estate-footer-contact">${o.phones.map(ph=>`<a href="tel:+91${ph.replace(/\D/g,'')}">${e(ph)}</a>`).join(' · ')}<br>${o.emails.map(m=>`<a href="mailto:${e(m)}">${e(m)}</a>`).join('<br>')}</p><p class="estate-small">${e(o.replyNote)}</p><p class="estate-small">${e(o.coverage)}</p><a class="estate-text-link" href="${e(o.mapUrl)}" target="_blank" rel="noopener">Open in Google Maps ↗</a></div><nav aria-label="Footer">${all.map(n=>`<a href="${href(n.href)}">${e(n.label)}</a>`).join('')}</nav></div><div class="estate-footer-wordmark" aria-hidden="true">${c.brandShort.split(' ').map(e).join('<br>')}</div><div class="estate-footer-bottom"><span>© ${new Date().getFullYear()} ${e(c.brand)} · ${e(c.footerNote)}</span><span class="estate-footer-legal"><a href="${href('/privacy/')}">Privacy</a><a href="${href('/disclaimer/')}">Disclaimer</a></span></div></footer>`;
}
export function renderPage(path,search,c,properties,href){
 if(path==='/')return {title:c.title,html:home(c,properties,href)};
 if(path==='/properties/')return {title:'Properties',html:listing(c,properties,href,search)};
 const p=properties.find(p=>path===`/properties/${p.slug}/`);
 if(p)return {title:p.name,html:propertyDetail(p,c,href,properties)};
 if(path==='/contact/')return {title:'Contact',html:contactPage(c,href,search)};
 if(path==='/land-valuation/')return {title:'What is your land worth?',html:enquiry(c,href,search,true)+converter(c)};
 if(path==='/areas/')return {title:'Where we work',html:areasIndex(c,href)};
 if(areaSlug.devprayag===path||areaSlug.kholachauri===path||areaSlug.pauri===path)return {title:pages[path].h1,html:areaPage(path,c,href,properties)};
 if(path==='/cottages/')return {title:'Turnkey cottage projects',html:cottagesPage(c,href)+close(c,href,'↗')};
 if(path==='/services/')return {title:'What we do',html:article(path,c,href,{inject:{'Every deal goes through these four steps':`<div class="estate-process-grid">${c.steps.map((st,i)=>`<article><span class="estate-meta">0${i+1} /</span><h3>${e(st.name)}</h3><dl><dt>You</dt><dd>${e(st.you)}</dd><dt>We</dt><dd>${e(st.we)}</dd></dl></article>`).join('')}</div>`}})+close(c,href,'↗')};
 if(path==='/about/')return {title:'About us',html:article(path,c,href)+close(c,href,'↗')};
 if(path==='/guide/')return {title:pages[path].h1,html:article(path,c,href,{skip:['On this page'],toc:true,tail:converter(c)})+close(c,href,'↗')};
 if(path==='/testimonials/')return {title:'What buyers say',html:testimonialsPage(c,href)};
 if(path==='/updates/')return {title:'Updates from the belt',html:updatesIndex(c,href)};
 if(path==='/updates/devprayag-railway-station/')return {title:pages[path].h1,html:article(path,c,href)+close(c,href,'↗')};
 if(path==='/referral/')return {title:'Refer a friend',html:referralPage(c,href)};
 if(path==='/disclaimer/'||path==='/privacy/')return {title:pages[path].h1,html:article(path,c,href)};
 if(path==='/thank-you/')return {title:'Thank you',html:thanksPage(c,href)};
 return {title:'Page not found',notFound:true,html:pageTitle('404','A different direction.','That page is not part of this site.')+`<section class="estate-section">${action('Back to the beginning',href('/'))}</section>`};
}
