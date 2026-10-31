import test from 'node:test';
import assert from 'node:assert/strict';
import {ratePerSqft,selectProperties,convertArea,buildEnquiry,whatsappURL} from '../site/real-estate/model.mjs';
import {content,properties} from './fixtures/demo-content.mjs';
test('mixed units sort by comparable square-foot rates, unknown prices last',()=>{
 assert.equal(ratePerSqft({rate:18000,rateUnit:'gaj'},content.units),2000);
 assert.deepEqual(selectProperties(properties,{sort:'price-low'},content.units).map(p=>p.id),['DEMO-02','DEMO-01','DEMO-04','DEMO-03','DEMO-05','DEMO-06']);
 assert.deepEqual(selectProperties(properties,{sort:'price-high'},content.units).slice(0,3).map(p=>p.id),['DEMO-04','DEMO-01','DEMO-02']);
 assert.equal(ratePerSqft({rate:1000000,rateUnit:'total',size:100,unit:'gaj'},content.units),1000000/900);
});
test('compound filters include sold and empty-result states',()=>{
 assert.deepEqual(selectProperties(properties,{area:'pauri',status:'Sold'},content.units).map(p=>p.id),['DEMO-06']);
 assert.equal(selectProperties(properties,{area:'devprayag',status:'Sold'},content.units).length,0);
 assert.equal(selectProperties(properties,{q:'demo-01'},content.units)[0].slug,'open-ridge');
});
test('land-unit conversion handles zero, decimals and invalid values',()=>{
 const result=convertArea(2,'nali',content.units);assert.equal(result.gaj,480);assert.equal(result.sqft,4320);
 assert.equal(convertArea(240,'gaj',content.units).nali,1);assert.equal(convertArea(0,'nali',content.units).sqft,0);
 assert.equal(convertArea(-1,'nali',content.units),null);assert.equal(convertArea(NaN,'nali',content.units),null);
});
test('drafts carry listing identity and require an explicit valid WhatsApp recipient',()=>{
 const message=buildEnquiry({intent:'buyer',name:'Preview',message:'Water & access?'},properties[0]);
 assert.match(message,/DEMO-01/);assert.match(message,/Water & access\?/);
 assert.throws(()=>whatsappURL(null,message));assert.throws(()=>whatsappURL('abc',message));
 assert.equal(new URL(whatsappURL('000000000000',message)).searchParams.get('text'),message);
});
