import { mountRealEstate } from './real-estate/template.mjs';
const template=mountRealEstate({root:document.querySelector('#app')});
// Exposed for local inspection and for a host router's lifecycle integration.
window.EstateTemplate=template;
