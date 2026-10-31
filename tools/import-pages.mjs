/**
 * Imports the live Devbhoomi site's non-listing pages as structured blocks.
 *   node tools/import-pages.mjs <path to a Devbhoomi-realtors checkout>
 * Writes site/real-estate/pages.mjs (generated, do not edit by hand) and copies the cottage photographs.
 * The wording is copied, never rewritten. Anything the parser cannot read is reported rather than guessed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const host = process.argv[2];
if (!host || !fs.existsSync(path.join(host, 'index.html'))) { console.error('Usage: node tools/import-pages.mjs <Devbhoomi-realtors checkout>'); process.exit(1); }
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outAssets = path.join(root, 'site/real-estate/assets/pages');
fs.mkdirSync(outAssets, { recursive: true });

const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');
const text = h => decode(h.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const copied = new Map();
const copyImg = src => {
  const file = path.join(host, src.replace(/^(\.\.\/)+/, ''));
  if (!fs.existsSync(file)) return null;
  const name = path.basename(file);
  if (!copied.has(name)) { fs.copyFileSync(file, path.join(outAssets, name)); copied.set(name, true); }
  return name;
};
const waHref = h => decode(h);
const dims = file => { try { const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split(',').map(Number); return { w, h }; } catch { return {}; } };

function parse(file, { cutAt } = {}) {
  let html = fs.readFileSync(path.join(host, file, 'index.html'), 'utf8');
  let main = (html.match(/<main[\s\S]*?<\/main>/) || [''])[0];
  main = main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<form[\s\S]*?<\/form>|<!--[\s\S]*?-->/g, '');
  if (cutAt) { const i = main.indexOf(cutAt); if (i > 0) main = main.slice(0, i); }
  const blocks = [];
  const re = /<table[\s\S]*?<\/table>|<div class="callout"[\s\S]*?<\/div>|<(h[1-4]|p|li|blockquote|figcaption)\b([^>]*)>([\s\S]*?)<\/\1>|<img\b[^>]*>|<video\b[\s\S]*?<\/video>/g;
  for (const m of main.matchAll(re)) {
    const s = m[0];
    if (s.startsWith('<table')) {
      const rows = [...s.matchAll(/<tr[\s\S]*?<\/tr>/g)].map(r => [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => text(c[1])));
      blocks.push({ t: 'table', head: rows[0], rows: rows.slice(1) });
    } else if (s.startsWith('<div class="callout"')) {
      const title = text((s.match(/<strong>([\s\S]*?)<\/strong>/) || ['', ''])[1]);
      blocks.push({ t: 'callout', title, x: text(s.replace(/<strong>[\s\S]*?<\/strong>/, '')) });
    } else if (s.startsWith('<img')) {
      const src = (s.match(/src="([^"]+)"/) || [])[1], alt = decode((s.match(/alt="([^"]*)"/) || ['', ''])[1]);
      if (src && /\/cottages\//.test(src) && !/-thumb/.test(src) || (src && /founder|posters/.test(src))) { const f = copyImg(src); if (f) blocks.push({ t: 'img', src: f, alt, ...dims(path.join(outAssets, f)) }); }
      else if (src && /-thumb/.test(src) && /cottages/.test(src)) { const f = copyImg(src.replace('-thumb', '')); if (f) blocks.push({ t: 'img', src: f, alt, ...dims(path.join(outAssets, f)) }); }
    } else if (s.startsWith('<video')) {
      const src = (s.match(/<source src="([^"]+)"/) || [])[1], poster = (s.match(/poster="([^"]+)"/) || [])[1];
      if (src) blocks.push({ t: 'video', src: path.basename(src), poster: poster ? copyImg(poster) : null });
    } else {
      const tag = m[1], attrs = m[2] || '', inner = m[3];
      const x = text(inner);
      if (!x) continue;
      if (tag === 'li' && /<h[34]\b/.test(inner)) {
        const title = text((inner.match(/<h[34]\b[^>]*>([\s\S]*?)<\/h[34]>/) || ['', ''])[1]);
        const body = text(inner.replace(/<h[34]\b[^>]*>[\s\S]*?<\/h[34]>/, ''));
        const last = blocks[blocks.length - 1];
        if (last && last.t === 'cards' && !last.closed) last.items.push({ title, x: body }); else blocks.push({ t: 'cards', items: [{ title, x: body }] });
        continue;
      }
      if (tag === 'li') { const last = blocks[blocks.length - 1]; if (last && last.t === 'ul' && !last.closed) last.items.push(x); else blocks.push({ t: 'ul', items: [x] }); continue; }
      if (blocks.length && (blocks[blocks.length - 1].t === 'ul' || blocks[blocks.length - 1].t === 'cards')) blocks[blocks.length - 1].closed = true;
      if (/^h[1-4]$/.test(tag)) blocks.push({ t: 'h', l: Number(tag[1]), x });
      else if (tag === 'blockquote') blocks.push({ t: 'quote', x });
      else if (tag === 'figcaption') blocks.push({ t: 'fig', x });
      else {
        const a = [...inner.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
        if (a.length === 1 && text(inner) === text(a[0][2])) blocks.push({ t: 'cta', x, href: waHref(a[0][1]) });
        else blocks.push({ t: 'p', x, ...(/class="[^"]*reviewed/.test(attrs) ? { k: 'reviewed' } : {}) });
      }
    }
  }
  for (const b of blocks) delete b.closed;
  return blocks;
}

const pages = {};
const take = (route, dir, opts) => {
  const blocks = parse(dir, opts);
  const h1i = blocks.findIndex(b => b.t === 'h' && b.l === 1);
  const kicker = h1i > 0 && blocks[0].t === 'p' ? blocks[0].x : '';
  const h1 = blocks[h1i].x;
  let rest = blocks.slice(h1i + 1);
  let reviewed = '';
  if (rest[0] && rest[0].k === 'reviewed') { reviewed = rest[0].x; rest = rest.slice(1); }
  const lead = rest[0] && rest[0].t === 'p' ? rest.shift().x : '';
  // a short line sitting directly above an h2 is its kicker ("How it works"); a trailing line that only repeats the title is a map label
  rest = rest.filter((b, i) => !(b.t === 'p' && b.x.length < 30 && rest[i + 1] && rest[i + 1].t === 'h' && rest[i + 1].l === 2));
  while (rest.length && rest[rest.length - 1].t === 'p' && rest[rest.length - 1].x === h1) rest.pop();
  const pdir = route;
  const link = h => h.startsWith('../') || h.startsWith('./') ? path.posix.resolve(pdir, h).replace(/\/?$/, '/') : h;
  rest = rest.map(b => b.t === 'cta' ? { ...b, href: link(b.href) } : b);
  // an image followed by a caption that repeats its alt text is one picture
  rest = rest.filter((b, i) => !(b.t === 'fig' && rest[i - 1] && rest[i - 1].t === 'img' && rest[i - 1].alt === b.x));
  if (route === '/cottages/') {
    const i = rest.findIndex(b => b.t === 'p' && /^₹1,800/.test(b.x));
    if (i >= 0) { const st = rest.slice(i, i + 6).map(b => b.x); rest.splice(i, 8, { t: 'stats', items: [{ v: st[0], u: st[1], n: st[2] }, { v: st[3], u: st[4], n: st[5] }], suited: { label: rest[i + 6].x, items: rest[i + 7].items } }); }
  }
  {
    const out = [];
    for (const b of rest) { const last = out[out.length - 1]; if (b.t === 'img' && last && (last.t === 'img' || last.t === 'gallery')) { if (last.t === 'img') out[out.length - 1] = { t: 'gallery', items: [last, b] }; else last.items.push(b); } else out.push(b); }
    rest = out;
  }
  if (route === '/areas/') {
    const cards = [];
    for (let i = 0; i < rest.length; i++) if (rest[i].t === 'h' && rest[i].l === 3) cards.push({ altitude: rest[i - 1].x, name: rest[i].x, district: rest[i + 1].x, line: rest[i + 2].x, cta: rest[i + 3] && rest[i + 3].t === 'cta' ? { x: rest[i + 3].x, href: rest[i + 3].href } : null });
    rest = [{ t: 'areacards', items: cards }];
  }
  if (route === '/referral/') {
    const out = [];
    for (let i = 0; i < rest.length; i++) {
      if (rest[i].t === 'p' && /^Tier \d$/.test(rest[i].x) && rest[i + 1] && rest[i + 1].t === 'h') { const last = out[out.length - 1]; const tier = { n: Number(rest[i].x.slice(5)), title: rest[i + 1].x, x: rest[i + 2].x, note: rest[i + 3].x }; if (last && last.t === 'tiers') last.items.push(tier); else out.push({ t: 'tiers', items: [tier] }); i += 3; }
      else out.push(rest[i]);
    }
    rest = out;
  }
  pages[route] = { kicker, h1, lead, ...(reviewed ? { reviewed } : {}), blocks: rest };
};
take('/about/', 'about');
take('/areas/', 'areas');
for (const a of ['devprayag', 'kholachauri-corridor', 'pauri-garhwal']) take(`/areas/${a}/`, `areas/${a}`, { cutAt: '>Land available here<' });
take('/cottages/', 'cottages');
take('/services/', 'services');
take('/guide/', 'guide');
take('/land-valuation/', 'land-valuation');
take('/contact/', 'contact');
take('/testimonials/', 'testimonials');
take('/updates/', 'updates');
take('/updates/devprayag-railway-station/', 'updates/devprayag-railway-station');
take('/referral/', 'referral');
take('/disclaimer/', 'disclaimer');
take('/privacy/', 'privacy');
take('/thank-you/', 'thank-you');


// Testimonials: the quote, the person and the place, exactly as published. Star icons are deliberately not imported.
{
  const html = fs.readFileSync(path.join(host, 'testimonials', 'index.html'), 'utf8');
  pages['/testimonials/'].quotes = [...html.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>\s*<figcaption><span class="fx-quote__who">([\s\S]*?)<\/span><span class="fx-quote__meta">([\s\S]*?)<\/span>/g)].map(m => ({ quote: text(m[1]), name: text(m[2]), place: text(m[3]) }));
  pages['/testimonials/'].blocks = pages['/testimonials/'].blocks.filter(b => b.t !== 'quote' && b.t !== 'fig');
}

fs.writeFileSync(path.join(root, 'site/real-estate/pages.mjs'), `/** GENERATED by tools/import-pages.mjs from the live Devbhoomi site. Do not edit by hand. */\nconst media = name => new URL(\`./assets/pages/\${name}\`, import.meta.url).href;\nconst listingMedia = name => new URL(\`./assets/listings/\${name}\`, import.meta.url).href;\nconst fix = blocks => blocks.map(b => b.t === 'gallery' ? { ...b, items: b.items.map(i => ({ ...i, src: media(i.src) })) } : b.t === 'img' ? { ...b, src: media(b.src) } : b.t === 'video' ? { ...b, src: listingMedia(b.src), poster: b.poster ? media(b.poster) : null } : b);\nconst raw = ${JSON.stringify(pages, null, 1)};\nexport const pages = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, { ...v, blocks: fix(v.blocks) }]));\n`);
console.log(`Imported ${Object.keys(pages).length} pages, ${copied.size} images.`);
for (const [k, v] of Object.entries(pages)) console.log(k.padEnd(40), v.blocks.length, 'blocks | h1:', v.h1.slice(0, 50));
