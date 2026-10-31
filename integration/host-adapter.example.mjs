import { mountRealEstate } from '../site/real-estate/template.mjs';
import { content as demoContent } from '../site/real-estate/content.mjs';

/** Map explicitly from the real, inspected host schema. Do not invent missing listing facts. */
export function mapProperty(record) {
  return {
    id: record.id, slug: record.slug, name: record.title, area: record.areaId,
    type: record.type, access: record.access || 'To confirm', status: record.status,
    size: record.size, unit: record.unit, rate: record.rate ?? null,
    rateUnit: record.rateUnit, image: record.image,
    view: record.view || 'To confirm', aspect: record.aspect || 'To confirm',
    documents: record.documentStatus || 'To confirm', description: record.description,
    demo: false,
  };
}
export function mountWithHost({root,siteContent,records,router,submitEnquiry}) {
  return mountRealEstate({
    root, content:{...demoContent,...siteContent}, properties:records.map(mapProperty),
    // The host is responsible for router listeners and calling instance.render(newURL).
    onNavigate:router?(url,options)=>router.navigate(url,options):undefined,
    // Keep the host's existing Lenis. Set scroll:true only after retiring its old owner.
    motion:{scroll:false},
    // Wire only the host's approved handler. Do not point the preview at a live form.
    onEnquiry:submitEnquiry,
  });
}
