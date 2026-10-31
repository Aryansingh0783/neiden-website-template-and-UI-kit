/**
 * What the assistant may know, and how it picks the part that answers a question.
 * Everything comes from the same files that build the pages: the office details, every plot, and every section of
 * every page. For each question only the best matching sections are sent to the model, and a question that matches
 * nothing is never sent at all, so the model has no chance to answer from its general knowledge.
 */
import { content, properties } from '../site/real-estate/content.mjs';
import { pages } from '../site/real-estate/pages.mjs';
import { seo } from '../site/real-estate/seo-data.mjs';

const lakh = n => (n >= 1e7 ? `${+(n / 1e7).toFixed(2)} crore` : `${+(n / 1e5).toFixed(2)} lakh`);
const areaName = id => content.areas.find(a => a.id === id)?.name || id;
const clip = (t, n) => (t.length <= n ? t : `${t.slice(0, n).replace(/\s+\S*$/, '')}...`);
const norm = s => String(s).replace(/\s+/g, ' ').trim();

function blockText(b) {
  switch (b.t) {
    case 'p': case 'fig': case 'quote': return b.x;
    case 'ul': return b.items.join('; ');
    case 'cards': return b.items.map(i => `${i.title}: ${i.x}`).join(' ');
    case 'table': return b.rows.map(r => r.join(' ')).join('; ');
    case 'callout': return `${b.title}: ${b.x}`;
    case 'stats': return `${b.items.map(i => `${i.v} ${i.u}. ${i.n}`).join(' ')} Suited to ${b.suited.items.join(', ')}.`;
    case 'areacards': return b.items.map(a => `${a.name} (${a.altitude}, ${a.district}): ${a.line}`).join(' ');
    case 'tiers': return b.items.map(t => `${t.title}: ${t.x} ${t.note}`).join(' ');
    default: return '';
  }
}
const split = (text, n = 700) => {
  const out = []; let cur = '';
  for (const s of norm(text).split(/(?<=[.!?])\s+/)) { if ((cur + ' ' + s).length > n && cur) { out.push(cur); cur = s; } else cur = cur ? `${cur} ${s}` : s; }
  if (cur) out.push(cur);
  return out;
};
const pageLabel = path => (seo[path]?.title || pages[path]?.h1 || path).split(' · ')[0];

/** Pages that describe the business. Reviews and the thank-you page are left out on purpose. */
const SKIP = new Set(['/testimonials/', '/thank-you/']);

export function buildChunks() {
  const chunks = [];
  const o = content.office;
  chunks.push({ path: '/contact/', title: 'Contact and office', text: `${content.brand}, ${o.address}. Phones: ${o.phones.map((p, i) => `${p} (${o.phoneNames[i]})`).join(', ')}. Email: ${o.emails.join(', ')}. ${o.hours}, WhatsApp anytime. We reply within 24 hours. Map: ${o.mapUrl}. ${o.coverage}` });
  chunks.push({ path: '/contact/', title: 'Land measurements', text: 'One nali is 16 muthi, 240 gaj, 2,160 sq ft or 200.67 sq m. One gaj is a square yard, 9 sq ft. 250 sq m is about 1.25 nali or 299 gaj.' });
  for (const [q, a] of content.faqs) chunks.push({ path: '/', title: q, text: `${q} ${a}` });
  for (const p of properties) {
    const price = p.status === 'Sold' ? 'sold' : `${p.priceLabel}${p.total ? `, ${lakh(p.total)} for the parcel` : ''}`;
    const size = p.size == null ? 'size on enquiry' : `${p.size} ${p.unit === 'sqm' ? 'sq m' : p.unit}`;
    chunks.push({ path: `/properties/${p.slug}/`, title: `${p.id} ${p.name}`, text: `${p.id}: ${p.name}. ${areaName(p.area)}, ${p.place || ''}. ${p.status}. Price: ${price}. Size: ${size}. Road access: ${p.access}. View: ${p.view}. Aspect: ${p.aspect}. ${clip(p.summary || '', 320)} ${(p.highlights || []).join('; ')}` });
  }
  for (const [id, path] of [['devprayag', '/areas/devprayag/'], ['kholachauri', '/areas/kholachauri-corridor/'], ['pauri', '/areas/pauri-garhwal/'], ['dehradun', '/areas/']]) {
    const list = properties.filter(p => p.area === id);
    const open = list.filter(p => p.status === 'Available').map(p => `${p.id} ${p.name} (${p.priceLabel})`);
    chunks.push({ path, title: `Plots in ${areaName(id)}`, text: `Plots in ${areaName(id)}. Available now: ${open.length ? open.join('; ') : 'none right now'}. Sold: ${list.filter(p => p.status === 'Sold').length}.` });
  }
  for (const [path, pg] of Object.entries(pages)) {
    if (SKIP.has(path)) continue;
    const label = pageLabel(path);
    let head = pg.h1, buf = [];
    const flush = () => { const t = buf.map(blockText).filter(Boolean).join(' '); if (t) split(`${t}`).forEach(s => chunks.push({ path, title: `${label}: ${head}`, text: `${head}. ${s}` })); buf = []; };
    if (pg.lead) buf.push({ t: 'p', x: pg.lead });
    for (const b of pg.blocks) { if (b.t === 'h' && (b.l === 2 || b.l === 3)) { flush(); head = b.x; } else buf.push(b); }
    flush();
  }
  return chunks;
}

const STOP = new Set('the and for are you your can how what which who whom whose this that with from have has had not but any all out our about into over under than then too very was were been being does did doing just also more most some such only own same its off per its get got give want need like tell please would could should may might will shall there their them they these those when where why while here hello thanks thank'.split(' '));
const SYN = {
  price: ['lakh', 'rate', 'cost', 'priced'], cost: ['price', 'lakh'], cheap: ['price', 'lakh'], expensive: ['price'], budget: ['price', 'lakh'],
  buy: ['buyer', 'purchase', 'outsider'], purchase: ['buy'], outsider: ['domicile', 'resident', 'outside'], outside: ['outsider', 'domicile'], delhi: ['outsider', 'outside'], nri: ['outsider'], resident: ['outsider', 'domicile'],
  paper: ['documents', 'registry', 'mutation', 'khatauni'], papers: ['documents', 'registry', 'mutation'], document: ['registry', 'mutation', 'khatauni'], legal: ['documents', 'registry'], registry: ['documents', 'mutation'],
  home: ['cottage', 'build'], house: ['cottage', 'build'], build: ['cottage', 'construction'], cottage: ['build', 'turnkey'], homestay: ['cottage', 'plots'], hotel: ['commercial', 'rooms'],
  visit: ['site', 'video', 'walk'], video: ['visit', 'walk'], call: ['phone', 'contact', 'whatsapp'], phone: ['contact', 'call'], number: ['phone', 'contact'], contact: ['phone', 'whatsapp', 'office'], address: ['office', 'contact', 'kholachauri'], location: ['office', 'area'], where: ['office', 'area'],
  sell: ['seller', 'valuation', 'worth'], selling: ['seller', 'valuation', 'worth'], worth: ['valuation', 'price'], valuation: ['worth', 'opinion'],
  view: ['himalayan', 'snow'], snow: ['himalayan', 'view'], mountain: ['himalayan', 'view'], road: ['access', 'highway'], highway: ['road', 'access'],
  refer: ['referral', 'friend', 'stay'], referral: ['refer', 'friend', 'stay', 'draw'], free: ['stay', 'draw'], railway: ['station', 'devprayag'], train: ['railway', 'station'],
  cheapest: ['price', 'lakh', 'rate'], lowest: ['price', 'lakh'], commission: ['paid', 'facilitator', 'pay'], fee: ['paid', 'pay'], fees: ['paid', 'pay'], reward: ['draw', 'stay', 'referral'], rewards: ['draw', 'stay', 'referral'], referring: ['referral', 'refer', 'draw', 'stay'], loan: ['payment', 'registry'], pay: ['payment', 'registry'], photo: ['photograph', 'video'], photos: ['photograph', 'video'],
  size: ['nali', 'gaj', 'sq'], area: ['areas', 'belt'], areas: ['area', 'belt'], available: ['plots', 'status'], sold: ['status'], safe: ['documents', 'registry'], scam: ['documents', 'registry']
};
const stem = w => (w.length > 4 && w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.length > 4 && w.endsWith('es') && !/(ses|xes|ches)$/.test(w) ? w.slice(0, -1) : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
export const tokens = s => norm(String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ')).split(' ').filter(w => w.length >= 3 && !STOP.has(w)).map(stem);

let cache;
const index = () => {
  if (cache) return cache;
  const chunks = buildChunks().map(c => ({ ...c, set: new Set(tokens(c.text)), tset: new Set(tokens(c.title)) }));
  const df = new Map();
  for (const c of chunks) for (const t of c.set) df.set(t, (df.get(t) || 0) + 1);
  cache = { chunks, df, N: chunks.length, all: chunks.map(c => c.text).join('\n') };
  return cache;
};
export const allFacts = () => index().all;

const GREETING = /^(hi|hii|hello|hey|namaste|good (morning|afternoon|evening)|thanks?|thank you|ok(ay)?|great|cool)\b[\s!.,]*$/i;
export const isGreeting = q => GREETING.test(norm(q)) || (norm(q).split(' ').length <= 2 && GREETING.test(norm(q).split(' ')[0]));
export const MIN_SCORE = 2.2;

/** The sections that best answer the latest question (and, more weakly, the one before it). */
const IDENTITY = /^(who are you|what do you do|what is this|what are you|about (you|us)|tell me about (you|us|devbhoomi)|what is devbhoomi)/i;
export function retrieve(turns, k = 5) {
  const { chunks, df, N } = index();
  const users = turns.filter(t => t.role === 'user').map(t => t.content);
  const weight = new Map();
  const add = (q, w) => { for (const t of tokens(q)) { weight.set(t, Math.max(weight.get(t) || 0, w)); for (const s of SYN[t] || []) weight.set(s, Math.max(weight.get(s) || 0, w * 0.6)); } };
  if (users.length > 1) add(users[users.length - 2], 0.4);
  if (users.length) add(users[users.length - 1], 1);
  if (users.length && IDENTITY.test(norm(users[users.length - 1]))) add('about services business land cottage', 1);
  const scored = chunks.map(c => {
    let s = 0;
    for (const [t, w] of weight) if (c.set.has(t)) s += w * Math.log(1 + N / (1 + (df.get(t) || 0))) * (c.tset.has(t) ? 1.5 : 1);
    return { c, s };
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const best = scored[0]?.s || 0;
  const picked = scored.filter(x => x.s >= best * 0.45).slice(0, k).map(x => x.c);
  return { relevant: best >= MIN_SCORE, best, chunks: picked };
}
