import { content as defaultContent, properties as defaultProperties } from './content.mjs';
import { escape, action, footer, propertyCard, renderPage, shell, routeList } from './components.mjs';
import { seo } from './seo-data.mjs';
import { mountAssistant } from './assistant.mjs';
import { normalPath, selectProperties, convertArea, whatsappURL, validPhone, sizeBoth, composeWhatsApp } from './model.mjs';
import { mountMotion } from '../effects/motion-kit.mjs';
import { reducedMotion } from '../effects/motion-config.mjs';

/** Mount once into an empty root. Host applications may provide onNavigate and onEnquiry. */
/** randomUUID needs a secure context (https or localhost); fall back so plain-http staging does not crash on mount. */
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export function mountRealEstate({root,content=defaultContent,properties=defaultProperties,basePath='/',onNavigate,onEnquiry,motion=true}={}) {
 if(!root)throw new Error('A root element is required.');
 if(root.dataset.estateMounted)throw new Error('Template is already mounted. Call destroy() before remounting.');
 root.dataset.estateMounted='true';root.classList.add('estate-app');root.style.setProperty('--estate-accent',content.accent);
 const href=path=>(basePath.replace(/\/$/,'')+normalPath(path)).split('/').map(segment=>encodeURIComponent(segment)).join('/');
 const cssURL=new URL('./theme.css',import.meta.url).href;
 if(![...document.querySelectorAll('link[rel=stylesheet]')].some(x=>x.href===cssURL)){const css=document.createElement('link');css.rel='stylesheet';css.href=cssURL;document.head.append(css);}
 const allNav=[...content.navigation,...content.secondaryNavigation];
 const nav=items=>items.map(n=>`<a href="${href(n.href)}">${escape(n.label)}</a>`).join('');
 const prerendered=root.querySelector('main[data-prerendered]');
 if(!prerendered)root.innerHTML=shell(content,href);
 const page=root.querySelector('main'),menu=root.querySelector('dialog'),menuButton=root.querySelector('.estate-menu-button');
 const effects=motion?mountMotion({anchorNavigation:false,revealSelector:'.estate-app [data-motion-reveal]',footerSelector:'.estate-app footer',...(typeof motion==='object'?motion:{})}):null;
 const signal=new AbortController();const listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:signal.signal});
 mountAssistant(root,{properties,href,titles:Object.fromEntries(Object.entries(seo).map(([k,v])=>[k,v.title.split(' · ')[0]])),signal:signal.signal});
 const positions=new Map();let key=history.state?.estateKey||uid(),busy=false,queued=null,oldOverflow='',destroyed=false,activeURL=new URL(location.href);
 const previousRestoration=history.scrollRestoration;
 if(!onNavigate){history.scrollRestoration='manual';history.replaceState({...history.state,estateKey:key},'');}
 const localPath=url=>normalPath(url.pathname.slice(basePath.replace(/\/$/,'').length));
 const known=url=>routeList(content,properties).some(r=>r===localPath(url));
 function closeMenu(){if(!menu.open)return;menu.close();menuButton.setAttribute('aria-expanded','false');document.body.style.overflow=oldOverflow;effects?.scroller?.start();effects?.setOverlayOpen(false);}
 function videoPreference(){for(const video of page.querySelectorAll('video')){if(reducedMotion())video.pause();else video.play().catch(()=>{});}}
 function formMessage(form){
   const rows=[];
   for(const el of form.querySelectorAll('[data-label]')){
     if(el.hasAttribute('data-skip'))continue;
     let v=el.value?el.value.trim():'';if(!v)continue;
     if(el.tagName==='SELECT')v=el.options[el.selectedIndex].text;
     if(el.name==='size')v=sizeBoth(v,form.querySelector('[name="unit"]')?.value,{nali:Number(form.dataset.nali)});
     rows.push({label:el.dataset.label,value:v});
   }
   return composeWhatsApp(form.dataset.waIntro,rows);
 }
 function paintPreview(form){
   const box=form.querySelector('[data-wa-preview]');if(!box)return;
   const msg=formMessage(form);box.replaceChildren();if(!msg)return;
   const label=document.createElement('p');label.className='estate-wa-preview-label';label.textContent='This is the message that will be sent';
   const body=document.createElement('p');body.className='estate-wa-preview-body';body.textContent=msg;box.append(label,body);
 }
 function validateForm(form,only){
   let first=null;
   for(const el of form.querySelectorAll('[required]')){
     if(only&&el!==only)continue;
     const bad=!el.value.trim()||(el.type==='tel'&&!validPhone(el.value)),wrap=el.closest('.estate-field'),err=wrap?.querySelector('[data-err]');
     wrap?.classList.toggle('is-invalid',bad);if(err)err.hidden=!bad;el.setAttribute('aria-invalid',String(bad));
     if(bad&&!first)first=el;
   }
   if(!only)first?.focus();return !first;
 }
 /** Fire-and-forget copy of the lead to our own server, so it is kept even if the visitor never sends the WhatsApp message. Never blocks the hand-off. */
 function captureEnquiry(form){
   try{
     const p={source:form.dataset.source,website:''};
     for(const el of form.querySelectorAll('[name]')){if(el.name!=='website')p[el.name]=el.value;}
     if(p.type&&!p.property_type)p.property_type=p.type;
     if(p.size&&p.unit)p.size=`${p.size} ${p.unit}`;
     p.lang='en';
     const body=JSON.stringify(p);
     if(navigator.sendBeacon)navigator.sendBeacon('/api/enquiries',new Blob([body],{type:'application/json'}));
     else fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});
   }catch{}
 }
 function initCounters(){
   const els=[...page.querySelectorAll('[data-count]')];
   if(!els.length||reducedMotion()||!('IntersectionObserver' in window))return;
   const run=el=>{const end=Number(el.dataset.count),suffix=el.dataset.suffix||'',t0=performance.now(),dur=1500;
     const step=now=>{const k=Math.min(1,(now-t0)/dur);el.textContent=Math.round(end*(1-Math.pow(1-k,3)))+suffix;if(k<1&&!destroyed)requestAnimationFrame(step);};requestAnimationFrame(step);};
   const io=new IntersectionObserver(entries=>{for(const en of entries)if(en.isIntersecting){io.unobserve(en.target);run(en.target);}},{threshold:.6});
   for(const el of els){el.textContent='0'+(el.dataset.suffix||'');io.observe(el);}
 }
 function draw(url){
   activeURL=new URL(url,location.href);const path=localPath(activeURL);
   const result=renderPage(path,activeURL.search,content,properties,href);
   page.innerHTML=result.html;page.dataset.route=path;document.title=seo[path]?.title||(result.title===content.title?content.title:`${result.title} · ${content.brand}`);
   for(const a of root.querySelectorAll('header nav a')){if(normalPath(new URL(a.href).pathname)===normalPath(activeURL.pathname))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
   videoPreference();initCounters();for(const f of page.querySelectorAll('[data-estate-form]'))paintPreview(f);effects?.refresh();effects?.scroller?.resize();
 }
 async function navigate(target,{pop=false}={}){
   const url=new URL(target,location.href);
   if(onNavigate&&!pop){onNavigate(url.pathname+url.search+url.hash,{replace:false,scroll:true,reason:'navigation'});closeMenu();return;}
   if(busy){queued={target:url.href,pop};return;}
   busy=true;positions.set(key,scrollY);closeMenu();effects?.scroller?.scrollTo(scrollY,{immediate:true});
   let restore=0;
   const update=()=>{
     if(destroyed)return;
     if(pop){key=history.state?.estateKey||uid();restore=positions.get(key)||0;}
     else{key=uid();history.pushState({estateKey:key},'',url);}
     draw(url);window.scrollTo({top:restore,behavior:'instant'});effects?.scroller?.scrollTo(restore,{immediate:true});
   };
   try{if(effects)await effects.transitionPage(update,page);else update();
     if(!pop)page.focus({preventScroll:true});
     if(url.hash){let target;try{target=root.querySelector(`#${CSS.escape(decodeURIComponent(url.hash.slice(1)))}`);}catch{}
       if(target){effects?.scroller?effects.scroller.scrollTo(target,{offset:-70,immediate:reducedMotion()}):target.scrollIntoView();}}
   }finally{busy=false;if(queued&&!destroyed){const next=queued;queued=null;navigate(next.target,{pop:next.pop});}}
 }
 function applyFilters(clear=false){
   const form=page.querySelector('[data-property-filters]');if(!form)return;
   if(clear){form.reset();for(const input of form.elements)if(input.name)input.value='';page.querySelector('[data-sort]').value='';}
   const filters=Object.fromEntries(new FormData(form));filters.sort=page.querySelector('[data-sort]').value;
   const params=new URLSearchParams(Object.entries(filters).filter(([,v])=>v));
   const url=new URL(activeURL);url.search=params.toString();activeURL=url;
   if(!onNavigate)history.replaceState({...history.state,estateKey:key},'',url);
   const selected=selectProperties(properties,filters,content.units);
   page.querySelector('[data-property-results]').innerHTML=selected.map(p=>propertyCard(p,content,href)).join('');
   page.querySelector('[data-result-count]').textContent=`${selected.length} ${properties.every(p=>p.demo)?'sample ':''}${selected.length===1?'property':'properties'}`;
   page.querySelector('[data-empty]').hidden=selected.length>0;effects?.refresh();
   if(onNavigate)onNavigate(url.pathname+url.search,{replace:true,scroll:false,reason:'filters'});
 }
 listen(menuButton,'click',()=>{oldOverflow=document.body.style.overflow;menu.showModal();document.body.style.overflow='hidden';menuButton.setAttribute('aria-expanded','true');effects?.scroller?.stop();effects?.setOverlayOpen(true);if(!reducedMotion())menu.querySelector('.estate-menu-columns').animate([{opacity:0,filter:'blur(10px)',transform:'translateY(20px)'},{opacity:1,filter:'blur(0)',transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)'});});
 listen(menu.querySelector('.estate-close'),'click',closeMenu);listen(menu,'cancel',event=>{event.preventDefault();closeMenu();});
 listen(root,'click',event=>{
   if(event.target.closest('[data-clear-filters]')){applyFilters(true);return;}
   const a=event.target.closest('a[href]');
   if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download'))return;
   const url=new URL(a.href,location.href);
   if(url.origin!==location.origin||!known(url))return;
   if(url.pathname===location.pathname&&url.search===location.search&&url.hash){
     let target;try{target=root.querySelector(`#${CSS.escape(decodeURIComponent(url.hash.slice(1)))}`);}catch{}
     if(!target)return;
     event.preventDefault();closeMenu();
     if(!onNavigate){positions.set(key,scrollY);key=uid();history.pushState({estateKey:key},'',url);activeURL=url;}
     if(!target.hasAttribute('tabindex')){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}
     target.focus({preventScroll:true});
     if(effects?.scroller)effects.scroller.scrollTo(target,{offset:target===page?0:-70,immediate:reducedMotion()});else target.scrollIntoView();
     return;
   }
   event.preventDefault();navigate(url);
 });
 listen(root,'change',event=>{if(event.target.closest('[data-property-filters]')||event.target.matches('[data-sort]'))applyFilters();});
 listen(root,'input',event=>{
   const input=event.target;if(!input.matches('[data-unit]'))return;
   const values=convertArea(input.valueAsNumber,input.dataset.unit,content.units);
   for(const field of input.closest('.estate-converter').querySelectorAll('[data-unit]'))if(field!==input)field.value=values?Number(values[field.dataset.unit].toFixed(4)):'';
 });
 listen(root,'submit',async event=>{
   if(event.target.matches('[data-property-filters]')){event.preventDefault();applyFilters();return;}
   const form=event.target.closest?.('[data-estate-form]');if(!form)return;
   event.preventDefault();
   const hp=form.querySelector('[name="website"]');if(hp&&hp.value)return;
   if(!validateForm(form))return;
   const message=formMessage(form),status=form.querySelector('[data-form-status]');
   if(onEnquiry){const button=form.querySelector('button[type=submit]');button.disabled=true;try{const fields=Object.fromEntries(new FormData(form));const result=await onEnquiry({form:form.dataset.estateForm,fields,message,source:form.dataset.source});status.textContent=result?.message||'Your enquiry is ready.';}catch{status.textContent='The enquiry could not be completed. Please try again.';}finally{button.disabled=false;}return;}
   if(form.dataset.post==='true')captureEnquiry(form);
   try{window.open(whatsappURL(form.dataset.waNumber,message),'_blank','noopener');}catch{status.textContent='The WhatsApp number is not set up correctly. Please call the office instead.';return;}
   navigate(form.dataset.thankyou);
 });
 listen(root,'input',event=>{const form=event.target.closest?.('[data-estate-form]');if(form){paintPreview(form);const wrap=event.target.closest('.estate-field');if(wrap?.classList.contains('is-invalid'))validateForm(form,event.target);}});
 listen(root,'change',event=>{const form=event.target.closest?.('[data-estate-form]');if(form)paintPreview(form);});
 if(!onNavigate)listen(window,'popstate',()=>navigate(location.href,{pop:true}));
 const media=matchMedia('(prefers-reduced-motion: reduce)');listen(media,'change',videoPreference);
 if(prerendered&&prerendered.dataset.route===localPath(activeURL)&&!activeURL.search){
   delete page.dataset.prerendered;
   for(const a of root.querySelectorAll('header nav a')){if(normalPath(new URL(a.href).pathname)===normalPath(activeURL.pathname))a.setAttribute('aria-current','page');}
   videoPreference();initCounters();for(const f of page.querySelectorAll('[data-estate-form]'))paintPreview(f);effects?.refresh();effects?.scroller?.resize();
 }else draw(location.href);
 return {navigate,render:draw,closeMenu,effects,content,properties,destroy(){destroyed=true;closeMenu();signal.abort();effects?.destroy();if(!onNavigate)history.scrollRestoration=previousRestoration;root.innerHTML='';root.classList.remove('estate-app');delete root.dataset.estateMounted;}};
}
