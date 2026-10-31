import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPage,propertyCard,propertyDetail} from '../site/real-estate/components.mjs';
import {content,properties} from '../site/real-estate/content.mjs';
const href=path=>path;
const routes=['/','/properties/','/areas/','/services/','/cottages/','/about/','/guide/','/contact/','/land-valuation/','/privacy/',...properties.map(p=>`/properties/${p.slug}/`)];
const voidTags=new Set(['img','input','br','hr','meta','link','source']);
function unbalanced(html){
 const stack=[],problems=[];
 for(const [,closing,tag,attrs] of html.matchAll(/<(\/?)([a-z0-9]+)([^>]*)>/gi)){
  const name=tag.toLowerCase();if(voidTags.has(name)||attrs.endsWith('/'))continue;
  if(!closing){stack.push(name);continue;}
  const top=stack.pop();if(top!==name){problems.push(`</${name}> closes <${top}>`);if(top)stack.push(top);}
 }
 return [...problems,...stack.map(t=>`<${t}> never closed`)];
}
test('every route renders balanced HTML',()=>{
 for(const route of routes)assert.deepEqual(unbalanced(renderPage(route,'',content,properties,href).html),[],route);
});
test('pattern attributes are valid under the browser v flag (an invalid pattern is silently ignored)',()=>{
 for(const route of routes)for(const [,pattern] of renderPage(route,'',content,properties,href).html.matchAll(/ pattern="([^"]*)"/g))
  assert.doesNotThrow(()=>new RegExp(`^(?:${pattern})$`,'v'),`${route}: ${pattern}`);
 const phone=renderPage('/contact/','',content,properties,href).html.match(/name="phone"[^>]*pattern="([^"]*)"/)[1];
 const re=new RegExp(`^(?:${phone})$`,'v');
 assert.ok(re.test('98112 19788')&&re.test('+91 (981) 121-9788'));
 assert.ok(!re.test('abc')&&!re.test('12345'));
});
test('bad unit or rate data never prints NaN or a zero rate',()=>{
 const broken={...properties[0],unit:'acre',rate:undefined};
 const out=propertyCard(broken,content,href)+propertyDetail(broken,content,href);
 assert.ok(!/NaN|₹0\b/.test(out));
 assert.match(out,/On enquiry/);
 const oddUnit={...properties[0],unit:'acre'};
 assert.ok(!/NaN|₹0\b/.test(propertyCard(oddUnit,content,href)));
});
