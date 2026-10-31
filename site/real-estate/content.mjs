/**
 * Devbhoomi Realtors content. The wording is the live site's own, copied rather
 * than rewritten. Listing records come from listings.mjs, which is generated from
 * the host's data (tools/import-devbhoomi.mjs). Nothing here is invented: where the
 * host does not publish a fact, the page says "To confirm".
 */
import { listings } from './listings.mjs';
const media = name => new URL(`./assets/${name}`, import.meta.url).href;
const listingImage = slug => listings.find(p => p.slug === slug)?.image;

export const content = {
  brand: 'Devbhoomi Realtors', brandShort: 'Devbhoomi Realtors', accent: '#ec4134',
  title: 'Land and plots, Rishikesh to Pauri · Devbhoomi Realtors',
  description: 'Land, plots and commercial property from Rishikesh up the Devprayag–Pauri belt to Pauri Garhwal. Papers checked before you visit. We live on this road.',
  hero: {
    eyebrow: 'Rishikesh, Devprayag, Kholachauri, Pauri', heading: 'land.', handwritten: 'worth seeing in person.',
    description: 'Plots and cottages on the Rishikesh, Devprayag and Pauri road.',
    image: media('hero-poster.jpg'), video: media('hero.mp4'), side: 'Office on the Devprayag–Pauri road',
    cta: 'WhatsApp us', ctaSecondary: 'See available land',
  },
  navigation: [{label:'Properties',href:'/properties/'},{label:'Areas',href:'/areas/'},{label:'Cottages',href:'/cottages/'},{label:'Contact',href:'/contact/'}],
  secondaryNavigation: [{label:'About',href:'/about/'},{label:'Services',href:'/services/'},{label:'From outside the state',href:'/guide/'},{label:'What is my land worth?',href:'/land-valuation/'},{label:'What buyers say',href:'/testimonials/'},{label:'Updates',href:'/updates/'},{label:'Refer a friend',href:'/referral/'}],
  disciplines: ['Buying assistance','Land & plot deals','Local consultation'],
  quicklinks: [{label:'Available plots',href:'/properties/'},{label:'Areas we work',href:'/areas/'},{label:'What is my land worth',href:'/land-valuation/'},{label:'Ask on WhatsApp',whatsapp:true}],
  intro: {
    heading: 'Find your place in the hills.', lead: 'Tell us what you need. We will help you see the right land.',
    body: 'Buying assistance, land deals and turnkey cottage development. One road from Rishikesh to Pauri, walked boundary by boundary.',
  },
  stats: [
    {value:'25+', label:'years in real estate', note:'senior management, branded developers'},
    {value:'10+', label:'deals closed', note:''},
    {value:'Kholachauri', label:'Based in', note:'office on the Devprayag–Pauri road'},
    {value:'Documents checked', label:'', note:'before money moves, on every deal'},
  ],
  available: { label: 'Available now', heading: 'Land on our books right now.', detail: 'Land currently on our books across the belt.', featured: ['sitton-khola-5-5-nali','kandogal-rishikesh-275-gaj','near-devprayag-railway-station'] },
  belt: { label: 'The belt', heading: 'The Devprayag–Pauri belt.', body: 'Roughly 135 km of road that climbs from Rishikesh at 340 m, through the river confluence at Devprayag, to a ridge town at 2,000 m. That climb is the whole story of this belt: it decides your view, your water, your winter, and your price.' },
  areas: [
    {id:'dehradun',href:'/properties/kandogal-rishikesh-275-gaj/',name:'Rishikesh & the valley',line:'The bottom of the road, where the hills meet the plains. Flat, plotted land, and the coming Devprayag railway station puts this end within reach.',image:listingImage('kandogal-rishikesh-275-gaj')},
    {id:'devprayag',href:'/areas/devprayag/',name:'Devprayag',line:'The gateway. Where the two rivers become the Ganga.',image:listingImage('chandrabadni-37-nali')},
    {id:'kholachauri',href:'/areas/kholachauri-corridor/',name:'Kholachauri & the road villages',line:'Our home ground. We do not operate here. We live here.',image:listingImage('sitton-khola-5-5-nali')},
    {id:'pauri',href:'/areas/pauri-garhwal/',name:'Pauri Garhwal',line:'The high end of the belt, and the snow line, on a clear morning.',image:listingImage('buranshi-4-5-nali-himalaya-view')},
  ],
  services: [
    {title:'Buying assistance',body:'We find land that matches what you actually want, walk it with you, and check the papers before any money moves.',cta:'Start with a WhatsApp message'},
    {title:'Land & plot deals',body:'Buying, selling and facilitating land across the belt, including deals we take on our own account.',cta:'Start with a WhatsApp message'},
    {title:'Local consultation',body:'The things a map cannot tell you: water in May, sun in December, who the neighbours are, what the road does in monsoon.',cta:'Start with a WhatsApp message'},
  ],
  servicesHeading: { label: 'What we do', heading: 'From the first call to the registry.', detail: 'From the first phone call to the mutation entry in your name.' },
  cottage: { label: 'We also build', heading: 'Buy the land through us, or bring your own. We build the cottage and hand it over.', body: 'Most people who buy land here want something standing on it. We take that second half of the job as well, design, structure, finish and handover, so the land purchase and the build are not two separate problems you have to solve from a city.', cta: 'See turnkey cottages' },
  cottageImage: media('cottage-aframe.jpg'),
  steps: [
    {name:'Contact & requirement', you:'Message or call. Tell us what you want the land for and roughly what you can spend.', we:'We ask the questions that narrow it down, and tell you honestly if the belt does not have what you are describing.'},
    {name:'Options & site visit', you:'Look at what we send. Come and walk it, or ask for a video walk if you cannot travel.', we:'We shortlist, arrange the visit, and walk the boundary on the ground with you, pointing out access, water and neighbours.'},
    {name:'Negotiation & document check', you:'Decide. Ask anything unresolved before you commit money.', we:'We negotiate, pull khata-khatauni and khasra records, and check for mutation and boundary issues. If something is unclear, we stop and tell you.'},
    {name:'Registry & handover', you:'Come for the registry, or arrange authority in advance if you cannot.', we:'We coordinate the deed writer and the Sub-Registrar office, and stay with it until mutation is recorded in your name.'},
  ],
  processHeading: { label: 'How it works', heading: 'You can do this from anywhere. We handle the ground.', detail: 'Four steps. What you do, and what we do.' },
  outside: {
    label: 'Buying from outside Uttarakhand', heading: 'Buying land in Uttarakhand when you are from outside the state.',
    can: ['Buy residential land up to about 250 sq m, roughly 1.25 nali, or about 2,690 sq ft.','Make one such purchase per family. Not one each for you, your spouse and your brother.','Sign an affidavit stating that you and your family hold no other residential land in the state beyond this limit.'],
    cannot: ['Buy agricultural or horticultural land anywhere in this belt. Pauri Garhwal and Tehri Garhwal are both among the eleven districts where this is barred for non-residents.','Exceed 250 sq m of residential land, or combine several plots to get around it.','Buy in the names of family members to multiply the limit. Purchases are tracked on a state portal now.'],
    note: 'General guidance, not legal advice. Rules change. We verify the current position at the time of your deal.', cta: 'Read the guide',
  },
  founder: {
    name: 'Resham Singh', image: media('founder.jpg'), caption: 'Resham Singh, on the Pauri ridge, snow line behind', label: 'The person you will be dealing with',
    heading: 'Twenty-five years in the business. Now on his own belt.',
    body: ['Resham Singh has spent more than twenty-five years in senior management in corporate real estate, running large portfolios for branded developers including Godrej Properties. Land acquisition through to launch and delivery, the whole cycle, at scale.','Devbhoomi Realtors applies that same discipline in Garhwal, title checks, boundary verification and a clean handover, run the way a large project would be run.'],
    cta: 'More about us',
  },
  faqs: [
    ['Which land documents should I check before buying?','At minimum: khata-khatauni (the record of rights showing who holds the land), the khasra number and map for the actual parcel, proof that mutation, dakhil-kharij, has been completed in the current owner\'s name, and a check that nothing is charged against the land. If mutation is pending, the sale can still happen, but it must be completed first and you should be told before you pay anything. We say that upfront on every listing where it applies.'],
    ['Can I get a property with a Himalaya view?','On the upper part of the belt, yes, around Pauri, north-facing plots see the snow line on clear mornings, mostly October to March. Two honest cautions: the view is seasonal and disappears in monsoon haze, and view plots carry a real premium. If the view is the main reason you are buying, visit once outside the clear season before you commit.'],
    ['Can someone from outside Uttarakhand buy land here?','Partly, and the rules tightened in 2025. In this belt a non-resident cannot buy agricultural or horticultural land at all, and residential purchase is capped at about 250 sq m, roughly 1.25 nali, as a single purchase per family, with an affidavit. We have written a full page on this because it is the question we are asked most.'],
  ],
  faqHeading: { label: 'Questions we are asked', heading: 'What we get asked most.' },
  closing: {
    label: 'Two ways to start', heading: 'Looking to buy here, or want to know what your land is worth?',
    buyer: { tag: 'Buyer', title: 'Looking for land', body: 'Tell us what it is for and roughly what you can spend. We will tell you plainly what this belt can and cannot give you.', cta: 'WhatsApp us', ctaSecondary: 'See available land' },
    seller: { tag: 'Seller', title: 'Selling your land', body: 'Send us the details. No calculator, a person who lives on this road reads it and calls you back within 24 to 48 hours.', cta: 'Ask what your land is worth' },
    note: 'Calls 10am – 6pm · WhatsApp anytime · We reply within 24 hours',
  },
  units: { nali:2160, gaj:9, sqft:1, sqm:10.76391041671 },
  office: {
    descriptor: 'Real estate consultants & cottage builders',
    address: 'Kholachauri village, Devprayag–Pauri road, Pauri Garhwal, Uttarakhand 246001',
    phones: ['98112 19788', '99905 15322'], phoneNames: ['Resham Singh', 'Subash Negi'], emails: ['s.resham@yahoo.co.in', '17aryan.resham@gmail.com'],
    replyNote: 'Email replies within 24–48 hours. WhatsApp is faster.', hours: 'Calls 10am – 6pm',
    coverage: 'We work the Devprayag–Pauri belt closely, and take selected land in the Dehradun valley.',
    mapUrl: 'https://maps.app.goo.gl/Egv4DGhV66Dg65o68',
  },
  contact: { whatsappNumber: '919811219788', telephone: '+919811219788', email: 's.resham@yahoo.co.in',
    greeting: 'Hello, I found your website and would like to ask about land on the Devprayag–Pauri belt.\n(sent from your website)' },
  footerNote: 'Prices are indicative. Land information is not legal advice.',
};

export const properties = listings;

/** Business facts for structured data, copied from the live site's own JSON-LD and contact page. */
export const business = {
	alternateName: 'Dev Bhoomi Realtors',
	geo: { latitude: 30.1566381, longitude: 78.6788746 },
	founder: 'Resham Singh',
	knowsAbout: ['Land and plot sales', 'Turnkey cottage development', 'Prefabricated PUF and steel-frame construction'],
	areaServed: ['Rishikesh', 'Dehradun valley', 'Devprayag', 'Kholachauri & the road villages', 'Pauri Garhwal', 'Kot block'],
	address: { streetAddress: 'Kholachauri village, Devprayag–Pauri road', addressLocality: 'Pauri Garhwal', addressRegion: 'Uttarakhand', postalCode: '246001', addressCountry: 'IN' },
	hours: { opens: '10:00', closes: '18:00' },
	languages: ['hi', 'en']
};
