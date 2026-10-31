# Devbhoomi integration map

Inspected 10 October 2026. **Preparation only:** this package has not been installed on devbhoomirealtors.com. It uses a neutral demonstration brand and six invented sample records. Do not migrate sample prices or photographs into a live inventory.

## What the public site needs

The [home page](https://devbhoomirealtors.com/) centers on land and cottages, local knowledge, viewing properties and contacting the team. It also has separate paths for buyers and landowners. That structure is why this version uses landscape imagery, clear property facts, large but restrained typography and enquiry CTAs rather than an architecture-studio portfolio.

| Existing feature | Template provision | Later integration action |
|---|---|---|
| [Properties](https://devbhoomirealtors.com/properties/): area, access, status, price sorting | `/properties/`, filters, empty state, mixed-unit sorting, local URL state | Map the real records; preserve existing slugs, IDs, sold status and unpriced records |
| [Property detail](https://devbhoomirealtors.com/properties/sitton-khola-5-5-nali/): photographs, facts and enquiry | Six sample detail routes; listing ID carried to enquiry | Replace sample data and media with the exact listing's evidence |
| [Areas](https://devbhoomirealtors.com/areas/) | Devprayag, Kholachauri, Pauri Garhwal, Dehradun valley selectors | Keep the site's full location pages, descriptions and actual geographic information |
| [Cottages](https://devbhoomirealtors.com/cottages/) | Separate land-plus-build / already-own-land paths | Retain actual specifications, work photography and approved cost/timeline copy |
| [Services](https://devbhoomirealtors.com/services/) | Accordion service section and a four-step journey | Map approved services and process language |
| [Seller enquiry](https://devbhoomirealtors.com/land-valuation/) | Name, phone, village, size/unit, type, access, documents, price and notes | Wire the existing approved WhatsApp draft flow; this preview has no recipient |
| [Contact](https://devbhoomirealtors.com/contact/) | Buyer/cottage form with listing context | Preserve public business contacts and current contact preferences |
| Land-unit conversion | Nali, gaj, sq ft and sq m; editable factors | Check factors against the site's measurement convention; not a legal eligibility calculator |
| Property/office maps | No fictional map or coordinates | Keep the host map and real markers; place it in the listing/detail section |
| Hindi site | English demo, Unicode-safe content rendering | Preserve `/hi/`, translation data and suitable Hindi fonts; do not machine-replace approved copy |
| [Referral](https://devbhoomirealtors.com/referral/), [testimonials](https://devbhoomirealtors.com/testimonials/), updates | Not invented or imported into this demo | Keep the host's real pages and approved records; add their links through navigation config |
| Buyer eligibility/legal information | A general question prompt only | Retain and review the host's current approved guide; no eligibility rules copied into this package |
| Dark theme, assistant and analytics | Not duplicated | Keep or modify those host modules deliberately; do not replace them as a side effect of installing motion |

## Important discovery: existing motion ownership

The live homepage DOM exposes these script paths:

- `/assets/js/vendor/lenis.min.js`
- `/assets/js/site.js`
- `/assets/js/fx.js`
- `/assets/js/kit.js`
- `/assets/js/motion-kit.js`
- `/assets/js/nlg.js`
- `/assets/js/assistant.js`

These script references were observed in the browser. The repository, precise initialization code, runtime globals and Lenis version have **not** been verified. Inspect the real checkout before deciding what to remove or reuse. Do not guess the name of its Lenis instance.

Two supported approaches:

1. **Keep the host scroll controller.** Add this package with `mountMotion({scroll:false})` for reveal and edge blur only. Tune the host's existing Lenis using the reference settings in `EFFECT-SOURCE-MAP.md`. The host continues to own RAF, anchor scrolling and route restoration.
2. **Replace the host scroll controller.** Explicitly destroy its old Lenis instance, cancel its old RAF and remove duplicate blur layers, then call `mountMotion()` once. Do not just add another `<script>` tag over the current setup.

Mark the intended text or images with `data-motion-reveal`. Add `data-motion-stagger` on a container only when its direct children should stagger. Mark nested native scroll areas with `data-motion-native`. Keep the footer selector accurate so the edge blur clears when contact/footer content enters view.

## Reuse levels

**Effects only:** Copy `site/effects/`. `integration/devbhoomi-motion.mjs` defaults to retaining the host scroll controller. The CSS is primarily `.motion-*` plus Lenis's document classes.

**Sections:** Use exported renderers in `site/real-estate/components.mjs`. Add `.estate-app` around the sections to scope the visual variables/CSS. Do not add a second header or router. Replace content in `content.mjs` or pass the host's data to the render functions.

**Full preview mount:** `mountRealEstate({root,content,properties})` owns its local router. With `onNavigate`, the host owns history, page rendering and scroll restoration. Navigation callbacks include `{replace,scroll,reason}` so filter changes can replace query state without moving the page. Call `instance.render(url)` after the host route changes. Use `motion:{scroll:false}` when retaining the host's Lenis. Call `instance.destroy()` during teardown.

For a host router, apply the navigation transition around the actual DOM update:

```js
await effects.transitionPage(async () => {
  await renderHostRoute(nextURL);
}, pageContainer);
```

Persistent navigation must sit outside `pageContainer`. Ordinary cross-document links need a host-level transition strategy; importing a blur module alone does not turn them into SPA transitions. Keep the existing site's navigation working while making that decision.

## Data and deployment boundaries

The adapter is an example contract, not a discovered Devbhoomi schema. Preserve unknown values as unknown; never turn an enquiry price into zero or infer document clearance. Preserve real property photos, availability, units, URLs and identifiers together.

The sample app is a client-rendered local preview. It is not a replacement for the host's server-rendered metadata, structured data, canonical URLs, bilingual routing or SEO. Use the existing production build/deployment process when a later user instruction authorizes integration. This handoff performs no migration, publication or form connection.
