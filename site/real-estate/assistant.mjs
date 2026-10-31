import { whatsappURL } from './model.mjs';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Static markup for the assistant. Prerendered into every page; the script below wires it up. */
export function assistantHTML(c) {
  const wa = whatsappURL(c.contact.whatsappNumber, c.contact.greeting);
  return `<div class="estate-assistant" data-assistant data-wa="${esc(wa)}" data-phone="${esc(c.office.phones[0])}"><button class="estate-assistant-open" type="button" aria-expanded="false" aria-controls="estate-assistant-panel">Ask us</button><section id="estate-assistant-panel" class="estate-assistant-panel" role="dialog" aria-label="Ask ${esc(c.brand)}" hidden><header><strong>Ask us</strong><button class="estate-assistant-close" type="button" aria-label="Close the assistant">×</button></header><div class="estate-assistant-log" role="log" aria-live="polite"><p class="estate-assistant-hello">Ask about plots, areas, papers or buying from outside the state.</p></div><form class="estate-assistant-form"><label class="estate-sr" for="estate-assistant-q">Your question</label><input id="estate-assistant-q" name="q" type="text" maxlength="600" autocomplete="off" required><button type="submit">Send</button></form><p class="estate-assistant-note">Answers come from our listings and pages. Confirm prices and papers with us. <a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp us</a></p></section></div>`;
}

/** Turns /properties/slug/ paths in a reply into links with the plot's name. Everything else stays plain text. */
export function linkify(text, properties, href = p => p) {
  const nodes = [], re = /\/properties\/([a-z0-9-]+)\//g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    const p = properties.find(x => x.slug === m[1]);
    if (!p) continue;
    if (m.index > last) nodes.push({ text: text.slice(last, m.index) });
    nodes.push({ text: p.name, href: href(`/properties/${p.slug}/`) });
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push({ text: text.slice(last) });
  return nodes;
}

export function messageFor(status) {
  if (status === 503) return 'notConfigured';
  if (status === 429) return 'tooMany';
  return 'failed';
}

export function mountAssistant(root, { properties, href = p => p, signal, fetchImpl = fetch } = {}) {
  const box = root.querySelector('[data-assistant]');
  if (!box) return;
  const openBtn = box.querySelector('.estate-assistant-open'), panel = box.querySelector('.estate-assistant-panel'), log = box.querySelector('.estate-assistant-log'), form = box.querySelector('form'), input = box.querySelector('input');
  const history = [];
  const opts = { signal };
  const say = (who, text, extra) => {
    const p = document.createElement('p');
    p.className = `estate-assistant-msg estate-assistant-${who}`;
    if (who === 'bot') for (const n of linkify(text, properties, href)) { if (n.href) { const a = document.createElement('a'); a.href = n.href; a.textContent = n.text; p.append(a); } else p.append(document.createTextNode(n.text)); }
    else p.textContent = text;
    if (extra) p.append(extra);
    log.append(p); log.scrollTop = log.scrollHeight; return p;
  };
  const contactLinks = () => { const s = document.createElement('span'); s.className = 'estate-assistant-links'; const a = document.createElement('a'); a.href = box.dataset.wa; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'WhatsApp us'; const t = document.createElement('a'); t.href = `tel:+91${box.dataset.phone.replace(/\D/g, '')}`; t.textContent = `Call ${box.dataset.phone}`; s.append(a, ' ', t); return s; };
  const setOpen = open => { panel.hidden = !open; openBtn.setAttribute('aria-expanded', String(open)); openBtn.hidden = open; if (open) input.focus(); else openBtn.focus(); };
  openBtn.addEventListener('click', () => setOpen(true), opts);
  box.querySelector('.estate-assistant-close').addEventListener('click', () => setOpen(false), opts);
  // Escape closes the panel wherever focus is, because following a link from an answer moves focus into the page.
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden && !document.querySelector('dialog[open]')) setOpen(false); }, opts);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const q = input.value.trim(); if (!q) return;
    input.value = ''; say('user', q); history.push({ role: 'user', content: q });
    const wait = say('bot', 'One moment.'); wait.classList.add('is-waiting'); form.querySelector('button').disabled = true;
    try {
      const res = await fetchImpl('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8) }) });
      wait.remove();
      if (!res.ok) { const k = messageFor(res.status); say('bot', k === 'notConfigured' ? 'The assistant is not switched on yet. Please ask us directly.' : k === 'tooMany' ? 'That is a lot of questions in a short time. Please try again in a few minutes, or ask us directly.' : 'The assistant could not answer just now. Please ask us directly.', contactLinks()); history.pop(); return; }
      const data = await res.json();
      history.push({ role: 'assistant', content: data.reply });
      say('bot', data.reply, data.guarded ? contactLinks() : null);
    } catch { wait.remove(); say('bot', 'The assistant could not answer just now. Please ask us directly.', contactLinks()); history.pop(); }
    finally { form.querySelector('button').disabled = false; input.focus(); }
  }, opts);
}
