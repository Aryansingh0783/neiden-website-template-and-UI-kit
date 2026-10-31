/**
 * POST /api/enquiries : stores a land-valuation lead and emails the office.
 * A port of the live site's Cloudflare Worker handler (same fields, limits, honeypot and rate limit).
 *
 * It does nothing until these Vercel environment variables are set, and this staging project must NOT have the live
 * keys. Without them it answers 503 "not_configured" and the form carries on with WhatsApp only, exactly as the live
 * site does before its keys are set.
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   where leads are stored (table `enquiries`, RPC `rate_limit_hit`)
 *   RESEND_API_KEY, RESEND_FROM, OFFICE_EMAIL  optional email to the office
 */
export const FIELDS = ['name', 'phone', 'email', 'village', 'size', 'property_type', 'access', 'docs', 'price', 'notes'];
export const LIMITS = { name: 100, phone: 20, email: 254, village: 120, size: 60, property_type: 60, access: 60, docs: 60, price: 60, notes: 5000 };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const configured = env => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
export const clean = v => (typeof v !== 'string' ? '' : v.replace(/[\x00-\x1F\x7F]/g, '').replace(/\s+/g, ' ').trim());
const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sb = (env, path, init = {}) => fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
async function clientKey(request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(buf)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function sendEmail(env, { to, subject, html, replyTo }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return { skipped: true };
  const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.RESEND_FROM, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }) });
  return { ok: res.ok, status: res.status };
}

/** Pure handler so it can be tested with a fake env and fetch. */
export async function handle(request, env = process.env) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!configured(env)) return json({ error: 'not_configured' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  if (!body || typeof body !== 'object') return json({ error: 'invalid_json' }, 400);
  // Honeypot: answer like a success so a bot learns nothing.
  if (clean(body.website)) return json({ ok: true }, 202);
  const row = {};
  for (const f of FIELDS) { const val = clean(body[f]).slice(0, LIMITS[f]); if (val) row[f] = val; }
  if (!row.name) return json({ error: 'name_required' }, 422);
  if (!row.phone && !row.email) return json({ error: 'phone_or_email_required' }, 422);
  row.lang = 'en';
  row.source = clean(body.source).slice(0, 120) || 'form';
  // 5 submissions per 10 minutes per client. Fails open so a genuine enquiry is never blocked.
  try {
    const res = await sb(env, 'rpc/rate_limit_hit', { method: 'POST', body: JSON.stringify({ p_key: `enq:${await clientKey(request)}`, p_max: 5, p_window_seconds: 600 }) });
    if (res.ok && (await res.json()) === false) return json({ error: 'rate_limited' }, 429);
  } catch { /* fail open */ }
  const insert = await sb(env, 'enquiries', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
  if (!insert.ok) return json({ error: 'store_failed' }, 500);
  const saved = (await insert.json())[0];
  // Email after the save, so an email outage can never lose a lead.
  if (env.OFFICE_EMAIL) {
    try {
      const lines = FIELDS.filter(f => saved[f]).map(f => `<tr><td style='padding:2px 10px 2px 0;color:#697565'>${escapeHtml(f.replace('_', ' '))}</td><td style='padding:2px 0'>${escapeHtml(saved[f])}</td></tr>`).join('');
      const html = `<h2 style='font-family:Georgia,serif'>New enquiry</h2><table style='font-family:Arial,sans-serif;font-size:14px'>${lines}</table><p style='font-family:Arial,sans-serif;font-size:12px;color:#697565'>Source: ${escapeHtml(saved.source)}</p>`;
      await sendEmail(env, { to: env.OFFICE_EMAIL, subject: `New enquiry: ${saved.name}${saved.village ? ` - ${saved.village}` : ''}`, html, replyTo: saved.email || undefined });
    } catch { /* best effort */ }
  }
  return json({ ok: true, id: saved.id }, 201);
}

export function POST(request) { return handle(request); }
export function GET(request) { return handle(request); }
