export const normalPath = path => `/${path.split('/').filter(Boolean).join('/')}${path.split('/').filter(Boolean).length ? '/' : ''}`;
export function ratePerSqft(property, units) {
  if (!Number.isFinite(property.rate) || property.rate < 0) return null;
  const divisor = property.rateUnit === 'total' ? property.size * units[property.unit] : units[property.rateUnit];
  return divisor > 0 ? property.rate / divisor : null;
}
export function selectProperties(properties, filters, units) {
  const term = (filters.q || '').toLocaleLowerCase().trim();
  const result = properties.filter(p => (!filters.area || p.area === filters.area) && (!filters.access || p.access === filters.access) && (!filters.status || p.status === filters.status) && (!filters.type || p.type === filters.type) && (!term || `${p.name} ${p.id} ${p.area} ${p.type}`.toLocaleLowerCase().includes(term)));
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
