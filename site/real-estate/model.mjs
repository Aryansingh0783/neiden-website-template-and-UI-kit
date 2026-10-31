export const normalPath = path => `/${path.split('/').filter(Boolean).join('/')}${path.split('/').filter(Boolean).length ? '/' : ''}`;
export function ratePerSqft(property, units) {
  if (!Number.isFinite(property.rate) || property.rate < 0) return null;
  const divisor = property.rateUnit === 'total' ? property.size * units[property.unit] : units[property.rateUnit];
  return divisor > 0 ? property.rate / divisor : null;
}
export function selectProperties(properties, filters, units) {
  const term = (filters.q || '').toLocaleLowerCase().trim();
  const result = properties.filter(p => (!filters.area || p.area === filters.area) && (!filters.access || p.access === filters.access) && (!filters.status || p.status === filters.status) && (!filters.type || p.type === filters.type) && (!term || `${p.name} ${p.id} ${p.place||''} ${p.area} ${p.type}`.toLocaleLowerCase().includes(term)));
  if (!filters.sort) result.sort((a,b) => (a.status==='Sold')-(b.status==='Sold'));
  if (filters.sort === 'price-low' || filters.sort === 'price-high') result.sort((a,b) => {
    const x=ratePerSqft(a,units),y=ratePerSqft(b,units);
    if(x===null)return y===null?0:1;
    if(y===null)return -1;
    return filters.sort==='price-low'?x-y:y-x;
  });
  if(filters.sort==='size')result.sort((a,b)=>(b.size*units[b.unit])-(a.size*units[a.unit]));
  return result;
}
export function convertArea(value, from, units) {
  if (!Number.isFinite(value) || value < 0 || !(units[from]>0)) return null;
  return Object.fromEntries(Object.entries(units).map(([unit,factor])=>[unit,value*units[from]/factor]));
}
export function buildEnquiry(fields, property) {
  const subject=fields.intent==='seller'?'Land enquiry from an owner':fields.intent==='cottage'?'Cottage project enquiry':'Property enquiry';
  return [subject,property?`Property: ${property.name} (${property.id})`:null,...Object.entries(fields).filter(([key,value])=>key!=='intent'&&String(value).trim()).map(([key,value])=>`${key.replaceAll('_',' ')}: ${String(value).trim()}`)].filter(Boolean).join('\n');
}
export function whatsappURL(number, message) {
  if(!/^\d{8,15}$/.test(number||''))throw new Error('Set a verified international WhatsApp number (digits only).');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Indian mobile number check: the last ten digits must start 6 to 9. */
export const phoneDigits = value => String(value ?? '').replace(/\D/g, '').slice(-10);
export const validPhone = value => /^[6-9]\d{9}$/.test(phoneDigits(value));
/** "5.5 nali (11,880 sq ft)": land is spoken in nali and read in square feet, so the message carries both. */
export function sizeBoth(value, unit, units) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || !(units?.nali > 0)) return String(value ?? '').trim();
  return unit === 'nali' ? `${n} nali (${Math.round(n * units.nali).toLocaleString('en-IN')} sq ft)` : `${n} sq ft (${(n / units.nali).toFixed(2)} nali)`;
}
/** The exact text a visitor will send on WhatsApp. Empty until at least one row has a value. */
export function composeWhatsApp(intro, rows) {
  const lines = rows.filter(r => String(r.value ?? '').trim()).map(r => `\u2022 ${r.label}: ${String(r.value).trim()}`);
  return lines.length ? [intro, ...lines].join('\n') : '';
}

