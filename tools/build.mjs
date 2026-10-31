/**
 * Static build for Vercel (and any static host).
 *   node tools/build.mjs
 * Prerenders every route to real HTML (so crawlers and link previews see the content without running JavaScript),
 * writes per-page head tags and JSON-LD, sitemap.xml, robots.txt and a real 404.html. The browser then hydrates the
 * same markup. Output goes to dist/.
 *
 * Environment:
 *   SITE_URL    canonical origin, default https://devbhoomirealtors.com
 *   SEO_INDEX=1 allow indexing. Without it every page is noindex and robots.txt blocks all crawlers (staging).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { content, properties, business } from '../site/real-estate/content.mjs';
import { pages } from '../site/real-estate/pages.mjs';
import { seo } from '../site/real-estate/seo-data.mjs';
import { renderPage, shell, routeList, escape as esc } from '../site/real-estate/components.mjs';
import { normalPath } from '../site/real-estate/model.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = path.join(root, 'site'), dist = path.join(root, 'dist');
const SITE = (process.env.SITE_URL || 'https://devbhoomirealtors.com').replace(/\/$/, '');
const INDEX = process.env.SEO_INDEX === '1';
const today = new Date().toISOString().slice(0, 10);
const fileBase = pathToFileURL(siteDir).href;
const href = p => normalPath(p).split('/').map(encodeURIComponent).join('/');
const abs = p => SITE + (p.startsWith('/') ? p : '/' + p);
const rel = url => String(url).startsWith(fileBase) ? String(url).slice(fileBase.length) : String(url);

const routes = routeList(content, properties).map(r => normalPath(r));
const NOINDEX = new Set(['/thank-you/']);
const bySlug = Object.fromEntries(properties.map(p => [`/properties/${p.slug}/`, p]));
const clip = (t, n) => (t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

function agent(url) {
  const o = content.office, a = business.address;
  return { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: content.brand, alternateName: [business.alternateName], description: content.description, url, image: abs(rel(content.hero.image)), geo: { '@type': 'GeoCoordinates', ...business.geo }, hasMap: o.mapUrl, telephone: '+91' + o.phones[0].replace(/\D/g, ''), email: o.emails[0], founder: { '@type': 'Person', name: business.founder }, knowsAbout: business.knowsAbout, areaServed: business.areaServed, address: { '@type': 'PostalAddress', ...a }, openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: business.hours.opens, closes: business.hours.closes }, knowsLanguage: business.languages };
}
function crumbs(route) {
  if (route === '/') return null;
  const p = bySlug[route];
  const items = [['Home', '/']];
  if (p) items.push(['Properties', '/properties/'], [p.place || p.name, null]);
  else if (route.startsWith('/areas/') && route !== '/areas/') items.push(['Areas', '/areas/'], [pages[route].h1, null]);
  else if (route.startsWith('/updates/') && route !== '/updates/') items.push(['Updates', '/updates/'], [pages[route].h1, null]);
  else { const label = [...content.navigation, ...content.secondaryNavigation].find(n => normalPath(n.href) === route)?.label || (pages[route] ? pages[route].h1 : route); items.push([label, null]); }
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p || route) })) };
}
function article(route) {
  const pg = pages[route], m = (pg.kicker || '').match(/(\d{1,2}) (\w+) (\d{4})/);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const date = m && months.indexOf(m[2]) >= 0 ? `${m[3]}-${String(months.indexOf(m[2]) + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
  const vid = pg.blocks.find(b => b.t === 'video');
  return { '@context': 'https://schema.org', '@type': 'Article', headline: pg.h1, description: seo[route]?.description || pg.lead, mainEntityOfPage: abs(route), ...(date ? { datePublished: date, dateModified: date } : {}), author: { '@type': 'Person', name: business.founder }, publisher: { '@type': 'RealEstateAgent', name: content.brand, url: abs('/') }, ...(vid ? { image: abs(rel(vid.poster || content.hero.image)) } : {}) };
}
function product(p, route) {
  const sqft = p.size != null && content.units[p.unit] ? Math.round(p.size * content.units[p.unit]) : null;
  const props = [p.size != null && p.unit !== 'sqm' ? { '@type': 'PropertyValue', name: `Area (${p.unit})`, value: p.size } : null, sqft ? { '@type': 'PropertyValue', name: 'Area (sq ft)', value: sqft } : null, { '@type': 'PropertyValue', name: 'Locality', value: content.areas.find(a => a.id === p.area)?.name || p.area }, { '@type': 'PropertyValue', name: 'Road access', value: p.access }].filter(Boolean);
  const sold = p.status === 'Sold';
  const offers = sold ? { '@type': 'Offer', url: abs(route), priceCurrency: 'INR', availability: 'https://schema.org/SoldOut', seller: { '@type': 'RealEstateAgent', name: content.brand } }
    : p.total ? { '@type': 'Offer', url: abs(route), priceCurrency: 'INR', availability: 'https://schema.org/InStock', price: p.total, seller: { '@type': 'RealEstateAgent', name: content.brand } } : undefined;
  return { '@context': 'https://schema.org', '@type': 'Product', name: p.name, url: abs(route), image: abs(rel(p.poster || p.image)), sku: p.id, category: p.type === 'Hotel' ? 'Hotel / commercial property' : 'Land / plot', description: seo[route]?.description || p.summary, brand: { '@type': 'Brand', name: content.brand }, additionalProperty: props, ...(offers ? { offers } : {}) };
}
const faqLD = list => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

function document_(route, result, { notFound = false } = {}) {
  const p = bySlug[route], meta = seo[route] || {};
  const title = meta.title || (route === '/' ? content.title : `${result.title} · ${content.brand}`);
  const description = meta.description && meta.description.length >= 60 ? meta.description : (pages[route]?.lead && pages[route].lead.length >= 60 ? pages[route].lead : content.description);
  const url = abs(route), image = abs(rel(p ? (p.poster || p.image) : content.hero.image));
  const index = INDEX && !notFound && !NOINDEX.has(route);
  const ld = [agent(url), crumbs(route), p ? product(p, route) : null, route.startsWith('/updates/') && route !== '/updates/' ? article(route) : null, (route === '/' || route === '/about/' || route === '/guide/') ? faqLD(content.faqs) : null].filter(Boolean);
  const html = shell(content, href, result.html, route).replaceAll(fileBase, '');
  const head = [
    '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="theme-color" content="#f6f6f3">',
    `<title>${esc(title)}</title>`, `<meta name="description" content="${esc(description)}">`,
    `<meta name="robots" content="${index ? 'index,follow,max-image-preview:large,max-snippet:-1' : (INDEX ? 'noindex,follow' : 'noindex,nofollow')}">`,
    notFound ? '' : `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="${p ? 'product' : 'website'}">`, `<meta property="og:site_name" content="${esc(content.brand)}">`, '<meta property="og:locale" content="en_IN">',
    `<meta property="og:title" content="${esc(title)}">`, `<meta property="og:description" content="${esc(description)}">`, `<meta property="og:url" content="${esc(url)}">`, `<meta property="og:image" content="${esc(image)}">`,
    '<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:title" content="${esc(title)}">`, `<meta name="twitter:description" content="${esc(clip(description, 200))}">`, `<meta name="twitter:image" content="${esc(image)}">`,
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">', '<link rel="preload" href="/real-estate/assets/display.woff2" as="font" type="font/woff2" crossorigin>',
    route === '/' ? `<link rel="preload" as="image" href="${esc(rel(content.hero.image))}" fetchpriority="high">` : '',
    '<link rel="stylesheet" href="/real-estate/theme.css">',
    '<style>body{margin:0;background:#f6f6f3}html{scroll-behavior:auto}#app{min-height:100vh}</style>',
    ...ld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)
  ].filter(Boolean).join('\n');
  return `<!doctype html>\n<html lang="en-IN"><head>\n${head}\n</head><body><div id="app" class="estate-app" style="--estate-accent:${esc(content.accent)}">${html}</div><script type="module" src="/boot.mjs"></script></body></html>\n`;
}

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(siteDir, dist, { recursive: true });
const writeRoute = (route, file, html) => { const out = path.join(dist, file); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html); };
let count = 0;
for (const route of routes) {
  const result = renderPage(route, '', content, properties, href);
  if (result.notFound) throw new Error(`Route ${route} rendered the 404 page. Fix the route list.`);
  writeRoute(route, route === '/' ? 'index.html' : `${route.slice(1)}index.html`, document_(route, result));
  count++;
}
writeRoute('/404/', '404.html', document_('/404/', renderPage('/404/', '', content, properties, href), { notFound: true }));
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(r => !NOINDEX.has(r)).map(r => `<url><loc>${abs(r)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, 'robots.txt'), INDEX ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
console.log(`Built ${count} pages and 404.html into dist/ (${INDEX ? 'indexable' : 'noindex staging'}, canonical ${SITE}).`);
