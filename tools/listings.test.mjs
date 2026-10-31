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
