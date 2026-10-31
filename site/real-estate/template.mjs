import { content as defaultContent, properties as defaultProperties } from './content.mjs';
import { escape, action, footer, propertyCard, renderPage } from './components.mjs';
import { normalPath, selectProperties, convertArea, buildEnquiry, whatsappURL } from './model.mjs';
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
 root.innerHTML=`<a href="#estate-page" class="estate-skip">Skip to content</a><header class="estate-shell estate-header"><a class="estate-brand" href="${href('/')}" aria-label="${escape(content.brand)} home">${escape(content.brandShort)}</a><nav aria-label="Primary">${nav(content.navigation)}</nav><button class="estate-menu-button" aria-label="Open menu" aria-controls="estate-menu" aria-expanded="false"></button></header><dialog class="estate-shell estate-menu" id="estate-menu" aria-label="Navigation" data-motion-native><div class="estate-menu-inner"><div class="estate-menu-top"><a class="estate-brand" href="${href('/')}" aria-label="${escape(content.brand)} home">${escape(content.brandShort)}</a><button class="estate-close" aria-label="Close menu">×</button></div><div class="estate-menu-columns"><nav aria-label="Expanded navigation">${nav(content.navigation)}</nav><nav class="estate-secondary-menu" aria-label="More pages">${nav(content.secondaryNavigation)}</nav></div><div class="estate-menu-bottom estate-meta"><span>Rishikesh / Devprayag / Kholachauri / Pauri</span><span>${escape(content.office.hours)}</span></div></div></dialog><main class="estate-shell estate-page" id="estate-page" tabindex="-1"></main><div class="estate-shell estate-footer-wrap">${footer(content,href)}</div>`;
 const page=root.querySelector('main'),menu=root.querySelector('dialog'),menuButton=root.querySelector('.estate-menu-button');
 const effects=motion?mountMotion({anchorNavigation:false,revealSelector:'.estate-app [data-motion-reveal]',footerSelector:'.estate-app footer',...(typeof motion==='object'?motion:{})}):null;
 const signal=new AbortController();const listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:signal.signal});
 const positions=new Map();let key=history.state?.estateKey||uid(),busy=false,queued=null,oldOverflow='',destroyed=false,activeURL=new URL(location.href);
 const previousRestoration=history.scrollRestoration;
 if(!onNavigate){history.scrollRestoration='manual';history.replaceState({...history.state,estateKey:key},'');}
 const localPath=url=>normalPath(url.pathname.slice(basePath.replace(/\/$/,'').length));
 const known=url=>{const p=localPath(url);return p==='/'||allNav.some(n=>normalPath(n.href)===p)||p==='/privacy/'||properties.some(x=>p===`/properties/${x.slug}/`);};
 function closeMenu(){if(!menu.open)return;menu.close();menuButton.setAttribute('aria-expanded','false');document.body.style.overflow=oldOverflow;effects?.scroller?.start();effects?.setOverlayOpen(false);}
 function videoPreference(){for(const video of page.querySelectorAll('video')){if(reducedMotion())video.pause();else video.play().catch(()=>{});}}
 function draw(url){
   activeURL=new URL(url,location.href);const path=localPath(activeURL);
   const result=renderPage(path,activeURL.search,content,properties,href);
   page.innerHTML=result.html;page.dataset.route=path;document.title=result.title===content.title?content.title:`${result.title} · ${content.brand}`;
   for(const a of root.querySelectorAll('header nav a')){if(normalPath(new URL(a.href).pathname)===normalPath(activeURL.pathname))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
   videoPreference();effects?.refresh();effects?.scroller?.resize();
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
   if(!event.target.matches('[data-enquiry]'))return;
   event.preventDefault();const form=event.target,fields=Object.fromEntries(new FormData(form));const property=properties.find(p=>p.id===fields.property_id);const message=buildEnquiry(fields,property),feedback=form.querySelector('[data-enquiry-feedback]');
   if(onEnquiry){const button=form.querySelector('button[type=submit]');button.disabled=true;try{const result=await onEnquiry({fields,property,message});feedback.textContent=result?.message||'Your enquiry is ready.';}catch{feedback.textContent='The enquiry could not be completed. Please try again.';}finally{button.disabled=false;}return;}
   feedback.innerHTML='<h3>Your draft is ready.</h3><p>Nothing has been sent. You can select and copy this text.</p><textarea aria-label="Enquiry draft" rows="10" readonly></textarea>';
   feedback.querySelector('textarea').value=message;
   if(content.contact.whatsappNumber){try{const a=document.createElement('a');a.className='estate-text-link';a.textContent='Open draft in WhatsApp ↗';a.href=whatsappURL(content.contact.whatsappNumber,message);a.target='_blank';a.rel='noopener';feedback.append(a);}catch{const note=document.createElement('p');note.className='estate-small';note.textContent='The WhatsApp number is not configured correctly, so no WhatsApp link was added. Copy the draft above instead.';feedback.append(note);}}
   effects?.scroller?.resize();
 });
 if(!onNavigate)listen(window,'popstate',()=>navigate(location.href,{pop:true}));
 const media=matchMedia('(prefers-reduced-motion: reduce)');listen(media,'change',videoPreference);
 draw(location.href);
 return {navigate,render:draw,closeMenu,effects,content,properties,destroy(){destroyed=true;closeMenu();signal.abort();effects?.destroy();if(!onNavigate)history.scrollRestoration=previousRestoration;root.innerHTML='';root.classList.remove('estate-app');delete root.dataset.estateMounted;}};
}
