import test from 'node:test';
import assert from 'node:assert/strict';
import {content,properties} from '../site/real-estate/content.mjs';
import {renderPage} from '../site/real-estate/components.mjs';
import {validPhone,phoneDigits,sizeBoth,composeWhatsApp} from '../site/real-estate/model.mjs';
import {handle,clean} from '../api/enquiries.js';
const href=p=>p,render=(r,s='')=>renderPage(r,s,content,properties,href).html;

test('phone check accepts Indian mobiles in common spellings and rejects the rest',()=>{
 for(const ok of ['9811219788','+91 98112 19788','098112-19788','91 9990515322'])assert.ok(validPhone(ok),ok);
 for(const bad of ['','12345','5811219788','abcdefghij','981121978'])assert.ok(!validPhone(bad),bad);
 assert.equal(phoneDigits('+91 98112 19788'),'9811219788');
});
test('size is written in both nali and square feet',()=>{
 assert.equal(sizeBoth('5.5','nali',content.units),'5.5 nali (11,880 sq ft)');
 assert.equal(sizeBoth('2160','sqft',content.units),'2160 sq ft (1.00 nali)');
 assert.equal(sizeBoth('','nali',content.units),'');
});
test('the WhatsApp message lists only filled rows and is empty when nothing is filled',()=>{
 assert.equal(composeWhatsApp('Hello',[{label:'A',value:''},{label:'B',value:'  '}]),'');
 assert.equal(composeWhatsApp('Hello',[{label:'Your name',value:'Asha'},{label:'Notes',value:''}]),'Hello\n• Your name: Asha');
});
test('the three forms exist with the live site fields, a honeypot, a preview box and a thank-you target',()=>{
 const v=render('/land-valuation/');
 for(const n of ['name','phone','village','size','unit','type','access','docs','price','notes','website'])assert.ok(v.includes(`name="${n}"`),`valuation ${n}`);
 assert.match(v,/data-source="valuation-form" data-post="true"/);
 const r=render('/referral/');
 for(const n of ['name','phone','referred_name','referred_phone','visit_when','notes','website'])assert.ok(r.includes(`name="${n}"`),`referral ${n}`);
 assert.match(r,/data-source="referral-form" data-post="false"/);
 const c=render('/contact/');
 for(const n of ['name','phone','interest','area','budget','message','website'])assert.ok(c.includes(`name="${n}"`),`contact ${n}`);
 for(const h of [v,r,c]){assert.match(h,/data-wa-preview/);assert.match(h,/data-thankyou="\/thank-you\/"/);assert.match(h,/data-wa-number="919811219788"/);assert.ok(!/Local preview|draft/i.test(h));}
});
test('every required field has an error message and the referral form never posts to the server',()=>{
 for(const [route,n] of [['/land-valuation/',7],['/referral/',4],['/contact/',2]]){const h=render(route);assert.equal((h.match(/ required /g)||[]).length,n,route);assert.equal((h.match(/ required[^>]*>[\s\S]*?data-err/g)||[]).length>=n,true);}
 assert.ok(!/data-source="referral-form" data-post="true"/.test(render('/referral/')));
});
test('coming from a plot page the contact form names the plot',()=>{
 const p=properties.find(x=>x.status==='Available'),h=render('/contact/',`?property=${p.id}`);
 assert.ok(h.includes('Hello, I am interested in this property:'));assert.ok(h.includes(p.id));
});
test('the contact page has the office map and the mobile contact bar is on every page',()=>{
 assert.match(render('/contact/'),/<iframe src="https:\/\/www\.google\.com\/maps\?q=30\.1566381,78\.6788746/);
});

// ---- api/enquiries.js with a fake Supabase and Resend
const env={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'k',OFFICE_EMAIL:'o@test',RESEND_API_KEY:'r',RESEND_FROM:'f@test'};
const post=(body,e=env)=>handle(new Request('https://x.test/api/enquiries',{method:'POST',body:typeof body==='string'?body:JSON.stringify(body)}),e);
function fakeFetch({limit=true,fail=false}={}){const calls=[];globalThis.fetch=async(url,init={})=>{calls.push({url:String(url),init});
 if(String(url).includes('rpc/rate_limit_hit'))return new Response(JSON.stringify(limit),{status:200});
 if(String(url).includes('/rest/v1/enquiries'))return fail?new Response('x',{status:500}):new Response(JSON.stringify([{id:7,...JSON.parse(init.body)}]),{status:201});
 return new Response('{}',{status:200});};return calls;}
test('api: does nothing and says so while the keys are not set (staging)',async()=>{
 const calls=fakeFetch();const res=await post({name:'A',phone:'9811219788'},{});
 assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'not_configured'});assert.equal(calls.length,0);
});
test('api: rejects bad input, swallows bots, stores and emails a good lead',async()=>{
 fakeFetch();
 assert.equal((await post('{nope')).status,400);
 assert.equal((await post({phone:'9811219788'})).status,422);
 assert.equal((await post({name:'A'})).status,422);
 let calls=fakeFetch();assert.equal((await post({name:'Bot',phone:'9811219788',website:'http://spam'})).status,202);assert.equal(calls.length,0);
 calls=fakeFetch();
 const res=await post({name:'  Asha\u0000 Rana ',phone:'98112 19788',village:'Khirsu',size:'5.5 nali',type:'ignored',notes:'x'.repeat(6000),evil:'<script>',source:'valuation-form'});
 assert.equal(res.status,201);
 const insert=calls.find(c=>c.url.endsWith('/rest/v1/enquiries')),row=JSON.parse(insert.init.body);
 assert.equal(row.name,'Asha Rana');assert.equal(row.notes.length,5000);assert.ok(!('evil' in row)&&!('type' in row));assert.equal(row.lang,'en');
 const mail=calls.find(c=>c.url.includes('resend.com'));assert.ok(mail);assert.ok(!JSON.parse(mail.init.body).html.includes('<script>'));
});
test('api: rate limit answers 429 and a database failure answers 500, never a false success',async()=>{
 fakeFetch({limit:false});assert.equal((await post({name:'A',phone:'9811219788'})).status,429);
 fakeFetch({fail:true});assert.equal((await post({name:'A',phone:'9811219788'})).status,500);
 assert.equal((await handle(new Request('https://x.test/api/enquiries'),env)).status,405);
 assert.equal(clean(' a  b \u0000'),'a b');
});
