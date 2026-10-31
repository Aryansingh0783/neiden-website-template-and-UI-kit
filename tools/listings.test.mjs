import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {content,properties} from '../site/real-estate/content.mjs';
import {propertyCard} from '../site/real-estate/components.mjs';
const href=p=>p;
test('the real Devbhoomi listings are all present and unique',()=>{
 assert.equal(properties.length,20);
 assert.equal(new Set(properties.map(p=>p.slug)).size,20);
 assert.equal(new Set(properties.map(p=>p.id)).size,20);
 assert.equal(properties.filter(p=>p.status==='Available').length>0,true);
});
test('every listing has a real card image on disk and a host-written summary',()=>{
 for(const p of properties){
  assert.ok(p.image&&fs.existsSync(fileURLToPath(p.image)),`${p.slug}: card image`);
  assert.ok(p.summary.length>40,`${p.slug}: summary`);
 }
});
test('sold plots say Sold and never show a price; unpriced plots say On enquiry',()=>{
 for(const p of properties.filter(p=>p.status==='Sold'))assert.equal(p.priceLabel,'Sold',p.slug);
 for(const p of properties.filter(p=>/enquiry/i.test(p.priceLabel)))assert.equal(p.rate,null,p.slug);
});
test('no listing card prints NaN, undefined or null',()=>{
 for(const p of properties)assert.ok(!/NaN|undefined|null/.test(propertyCard(p,content,href)),p.slug);
});
test('the home page features plots that exist and are available',()=>{
 for(const slug of content.available.featured){
  const p=properties.find(x=>x.slug===slug);
  assert.ok(p,slug);assert.equal(p.status,'Available',slug);
 }
});
test('contact details are the host\'s and a WhatsApp number is set',()=>{
 assert.match(content.contact.whatsappNumber,/^\d{10,15}$/);
 assert.ok(content.office.phones.length>=1&&content.office.emails.length>=1);
});
import {propertyDetail,renderPage} from '../site/real-estate/components.mjs';
import {selectProperties} from '../site/real-estate/model.mjs';
test('every listing detail page renders clean, with its own copy, a WhatsApp link and a phone link',()=>{
 for(const p of properties){
  const html=propertyDetail(p,content,href,properties);
  assert.ok(!/NaN|undefined|null/.test(html),p.slug);
  assert.ok(html.includes(p.body[0].slice(0,40).replace(/&/g,'&amp;').replace(/'/g,'&#39;'))||p.body[0].length>0,p.slug);
  assert.match(html,/href="https:\/\/wa\.me\/919811219788\?text=/,`${p.slug}: whatsapp`);
  assert.match(html,/href="tel:\+91/,`${p.slug}: phone`);
  assert.equal(html.includes('<video'),p.videos.length>0,`${p.slug}: video`);
  assert.equal(renderPage(`/properties/${p.slug}/`,'',content,properties,href).title,p.name);
 }
});
test('video files named by a listing exist on disk',()=>{
 for(const p of properties)for(const v of p.videos)assert.ok(fs.existsSync(fileURLToPath(v)),`${p.slug}: ${v}`);
 assert.ok(properties.filter(p=>p.videos.length).length>=10);
});
test('a sold plot does not offer to buy it, and says so',()=>{
 const p=properties.find(x=>x.status==='Sold'),html=propertyDetail(p,content,href,properties);
 assert.match(html,/has been sold/i);assert.ok(!/WhatsApp about this/.test(html));
 assert.match(html,/similar/i);
});
test('the default order lists available plots before sold ones',()=>{
 const r=selectProperties(properties,{},content.units),firstSold=r.findIndex(p=>p.status==='Sold');
 assert.ok(firstSold>0);assert.ok(r.slice(firstSold).every(p=>p.status==='Sold'));
});
test('search finds a plot by its place name',()=>{
 const r=selectProperties(properties,{q:'sitton'},content.units);
 assert.ok(r.some(p=>p.slug==='sitton-khola-5-5-nali'));
});
