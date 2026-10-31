/** Demonstration content. Replace these records through the adapter; none are live listings. */
const media = name => new URL(`./assets/${name}`, import.meta.url).href;
export const content = {
  brand: 'acre.', title: 'acre. — Land, cottages & a different pace', accent: '#ec4134',
  hero: { eyebrow: 'Land / Cottages / Local knowledge', heading: 'closer.', handwritten: 'to a different life.', description: 'Open land. A quiet cottage. Space for what comes next. Find a place that feels like yours.', image: media('landscape.jpg'), video: null },
  // The original Neiden wave is bundled. Set hero.video to media('wave.mp4') to use it.
  navigation: [{label:'Properties',href:'/properties/'},{label:'The areas',href:'/areas/'},{label:'Cottages',href:'/cottages/'},{label:'Let’s talk',href:'/contact/'}],
  secondaryNavigation: [{label:'Our approach',href:'/about/'},{label:'Services',href:'/services/'},{label:'Buyer guide',href:'/guide/'},{label:'Sell your land',href:'/land-valuation/'}],
  areas: [
    {id:'devprayag',name:'Devprayag',line:'River valleys. A slower rhythm.',image:media('landscape.jpg')},
    {id:'kholachauri',name:'Kholachauri',line:'Road villages. Room to settle.',image:media('cottage.jpg')},
    {id:'pauri',name:'Pauri Garhwal',line:'Ridge country. Open horizons.',image:media('woodland.jpg')},
    {id:'dehradun',name:'Dehradun valley',line:'At the meeting of hills and plains.',image:media('landscape.jpg')},
  ],
  services: [
    {title:'Find your land.',body:'Begin with how you want to use the place. Compare the setting, the approach road, the size and the information available before arranging a visit.',tags:'Search / Shortlist / Site visit'},
    {title:'Plan your cottage.',body:'Start with the ground: access, slope, light and the spaces you need. Bring an existing plot, or explore land and a cottage together.',tags:'Land / Design / Development'},
    {title:'Make your next move.',body:'A place to bring your questions about buying or selling. Share the details, then discuss the next step with someone who knows the area.',tags:'Buyer enquiries / Seller enquiries'},
  ],
  steps: [['Tell us.','The setting, the purpose, and the budget you have in mind.'],['Explore.','Compare a shortlist, then walk the land or arrange a video visit.'],['Understand.','Discuss the road, the boundaries and the document position.'],['Take the next step.','Agree what needs to happen before moving forward.']],
  faqs: [
    ['What should I look for on a site visit?','Look beyond the view. Ask about the approach, boundaries, slope, water, sunlight and the document position. Record the questions that need a clear answer.'],
    ['Can I explore a property before travelling?','Use the enquiry form to ask for photographs or a video walk-through, then arrange a visit when you have narrowed your shortlist.'],
    ['Can I discuss a cottage on land I already own?','Yes. The cottage enquiry includes a place to describe the plot, its location and what you would like to build.'],
  ],
  cottageImage: media('cottage.jpg'),
  units: { nali:2160, gaj:9, sqft:1, sqm:10.76391041671 },
  contact: { whatsappNumber:null, telephone:null, email:null },
  demoNotice:'Independent template preview. Sample properties and illustrative photography; not Devbhoomi’s live inventory.',
};

export const properties = [
  {id:'DEMO-01',slug:'open-ridge',name:'The open ridge',area:'pauri',type:'Land',access:'Road-touch',status:'Available',size:3,unit:'nali',rate:650000,rateUnit:'nali',image:media('landscape.jpg'),view:'Open landscape',aspect:'To confirm',documents:'To be supplied',description:'A sample land record for exploring the listing layout. Replace the area, photographs, price and document information with the verified property record.',demo:true},
  {id:'DEMO-02',slug:'pine-edge',name:'At the forest edge',area:'kholachauri',type:'Land',access:'Branch road',status:'Available',size:2,unit:'nali',rate:525000,rateUnit:'nali',image:media('woodland.jpg'),view:'Woodland',aspect:'To confirm',documents:'To be supplied',description:'A sample record with road access, local land units and a price per unit. This photograph illustrates the visual treatment and is not a photograph of land for sale.',demo:true},
  {id:'DEMO-03',slug:'valley-ground',name:'A little valley ground',area:'devprayag',type:'Land',access:'Highway-touch',status:'Available',size:4,unit:'nali',rate:null,rateUnit:'nali',image:media('landscape.jpg'),view:'Valley',aspect:'To confirm',documents:'To be supplied',description:'An enquiry-priced example. Missing prices stay unpriced throughout filters and sorting; no estimate is generated.',demo:true},
  {id:'DEMO-04',slug:'garden-plot',name:'The garden plot',area:'dehradun',type:'Land',access:'Road-touch',status:'Available',size:220,unit:'gaj',rate:18000,rateUnit:'gaj',image:media('woodland.jpg'),view:'Green surroundings',aspect:'To confirm',documents:'To be supplied',description:'A gaj-based sample to demonstrate mixed-unit price comparison. All sample data must be replaced before use as a real listing.',demo:true},
  {id:'DEMO-05',slug:'woodland-cottage',name:'The woodland cottage',area:'kholachauri',type:'Cottage',access:'Branch road',status:'Available',size:1400,unit:'sqft',rate:null,rateUnit:'total',image:media('cottage.jpg'),view:'Forest',aspect:'To confirm',documents:'To be supplied',description:'An illustrative cottage record with room for project photography, specifications and a cottage-specific enquiry.',demo:true},
  {id:'DEMO-06',slug:'ridge-retreat',name:'The ridge retreat',area:'pauri',type:'Land',access:'Highway-touch',status:'Sold',size:2.5,unit:'nali',rate:null,rateUnit:'nali',image:media('landscape.jpg'),view:'Ridge',aspect:'To confirm',documents:'To be supplied',description:'A sold sample retained to demonstrate status filters. Its enquiry asks about similar properties rather than suggesting this one is available.',demo:true},
];
