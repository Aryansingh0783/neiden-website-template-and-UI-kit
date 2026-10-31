import test from 'node:test';
import assert from 'node:assert/strict';
import {content,properties} from '../site/real-estate/content.mjs';
import {renderPage,routeList,shell} from '../site/real-estate/components.mjs';
import {pages} from '../site/real-estate/pages.mjs';
const href=p=>p,render=r=>renderPage(r,'',content,properties,href);
test('every route renders a real page with no placeholder text',()=>{
 for(const r of routeList(content,properties)){
  const o=render(r);assert.ok(!o.notFound,r);assert.ok(o.html.length>400,r);
  assert.ok(!/undefined|NaN|\[object|null</.test(o.html),`${r}: placeholder text`);
  assert.equal((o.html.match(/<h1[ >]/g)||[]).length,1,`${r}: one h1`);
 }
});
test('the business name, not a short mark, is in the header, menu and footer',()=>{
 const html=shell(content,href);
 assert.ok((html.match(/estate-brand" href="\/" aria-label="Devbhoomi Realtors home">Devbhoomi Realtors</g)||[]).length===2,'header and menu brand');
 assert.match(html,/estate-footer-wordmark" aria-hidden="true">Devbhoomi<br>Realtors</);
 assert.ok(!/devbhoomi\./i.test(html.replace(/devbhoomirealtors\.com/gi,'')));
});
test('footer carries every secondary page and both legal links',()=>{
 const html=shell(content,href);
 for(const p of ['/testimonials/','/updates/','/referral/','/privacy/','/disclaimer/','/guide/'])assert.ok(html.includes(`href="${p}"`),p);
});
test('testimonials show the six published quotes with names and places, and no star ratings',()=>{
 const html=render('/testimonials/').html;
 assert.equal(pages['/testimonials/'].quotes.length,6);
 for(const q of pages['/testimonials/'].quotes){assert.ok(html.includes(q.name)&&html.includes(q.place));assert.ok(q.quote.length>60);}
 assert.ok(!/\bstars?\b|5 out of 5|★/i.test(html));
});
test('contact lists both phones with names, both emails, the address and the map',()=>{
 const html=render('/contact/').html;
 for(const x of ['98112 19788','Resham Singh','99905 15322','Subash Negi','s.resham@yahoo.co.in','17aryan.resham@gmail.com','Kholachauri village',content.office.mapUrl,'wa.me/919811219788'])assert.ok(html.includes(x),x);
});
test('each area page lists only available plots in its own area',()=>{
 for(const [r,id] of [['/areas/devprayag/','devprayag'],['/areas/kholachauri-corridor/','kholachauri'],['/areas/pauri-garhwal/','pauri']]){
  const html=render(r).html,mine=properties.filter(p=>p.area===id);
  for(const p of mine)assert.equal(html.includes(`/properties/${p.slug}/`),p.status==='Available',`${r} ${p.slug}`);
  for(const p of properties.filter(p=>p.area!==id))assert.ok(!html.includes(`/properties/${p.slug}/`),`${r} leaked ${p.slug}`);
 }
});
test('the guide keeps its not-legal-advice warning and the last-reviewed date',()=>{
 const html=render('/guide/').html;
 assert.match(html,/This is not legal advice/);assert.match(html,/Last reviewed: 2026-07-26/);assert.match(html,/id="who-counts-as-an-outsider"/);
 assert.equal((html.match(/>On this page</g)||[]).length,1);
});
test('referral keeps its three tiers and rules; cottages keep price range and gallery',()=>{
 const r=render('/referral/').html;assert.equal((r.match(/Tier \d/g)||[]).length,3);assert.match(r,/The rules, plainly/);
 const c=render('/cottages/').html;assert.match(c,/₹1,800–3,500/);assert.equal((c.match(/<figure>/g)||[]).length,6);
});
test('the old template wording is gone from every page',()=>{
 for(const r of routeList(content,properties)){const h=render(r).html;assert.ok(!/preview|template|sample|demonstration|acre\./i.test(h.replace(/<(script|style)[\s\S]*?<\/\1>/g,'').replace(/<[^>]+>/g,' ').replace(/file:\/\/\S+/g,'')),`${r}: ${(h.match(/.{25}(preview|template|sample|demonstration|acre\.).{25}/i)||[])[0]}`);}
});
test('home: hero button says Get in touch, featured plots are the owner-chosen ones, number stats can count up',()=>{
 const h=render('/').html;
 assert.match(h,/Get in touch with us/);assert.ok(!/estate-hero-actions[\s\S]{0,300}WhatsApp us/.test(h));
 assert.deepEqual(content.available.featured,['sitton-khola-5-5-nali','kandogal-rishikesh-275-gaj','khirsu-village-land']);
 assert.ok(!h.includes('/properties/near-devprayag-railway-station/'));
 assert.equal((h.match(/data-count="(25|10)" data-suffix="\+"/g)||[]).length,2);
 assert.ok(h.includes('<span class="estate-sr">25+</span>')&&h.includes('<span class="estate-sr">10+</span>'));
});
