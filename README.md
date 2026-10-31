# Neiden-style real estate template

A complete local frontend tailored for a later **Devbhoomi Realtors** integration. The visual direction follows Neiden: oversized type, a handwritten accent, quiet grid lines, smooth navigation, progressive blur and restrained reveals. The business structure is built around land, local areas, cottages and buyer/seller enquiries.

This package is a standalone authored template. It does not need Framer, React, npm dependencies, API keys or an account. The original Nordå reproduction remains in the separately delivered `NORDA-CLONE-FULL-PACKAGE.zip`.

## Run

Install Node.js 18 or newer if needed. Double-click `START-WINDOWS.cmd`, or run:

```sh
npm start
```

Open http://127.0.0.1:4173/. Keep the terminal running. Stop with Ctrl+C. If that port is occupied, stop the other preview first or set the `PORT` environment variable.

## Included

- 16 working preview routes: home, property index, six property details, areas, cottages, services, about, buyer guide, buyer enquiry, seller enquiry and privacy.
- Area, road-access, status and property-type filters, keyword search, empty states and URL-preserved selections.
- Price sorting normalized to square feet, including nali/gaj records and unpriced entries.
- Four-way land-unit converter; configurable conversion factors.
- Buyer, cottage and seller forms that prepare local drafts. No connected recipient or backend.
- Keyboard-accessible responsive menu, focus restoration, scroll restoration, reduced-motion handling and locally bundled media/fonts.
- Separate effects modules and host-adapter examples for use with existing pages.

## Edit

| File | Purpose |
|---|---|
| `site/real-estate/content.mjs` | Branding, imagery, demo records, areas, services, FAQs, units and contact configuration |
| `site/real-estate/components.mjs` | Page sections and reusable HTML renderers |
| `site/real-estate/theme.css` | Visual system scoped to `.estate-app` |
| `site/real-estate/template.mjs` | Mount/unmount, routing, menu, filters and enquiry events |
| `site/real-estate/model.mjs` | Pure filter, unit, price and enquiry functions |
| `site/effects/motion-config.mjs` | Central scroll/blur/navigation settings |
| `integration/` | Host adapter, motion-only bootstrap and TypeScript data contract |
| `docs/DEVBHOOMI-INTEGRATION.md` | What maps to Devbhoomi, what to preserve and how to integrate later |

All property records are explicitly marked samples. Photographs are illustrative stock, not Devbhoomi listings or location evidence. Replace them together with the records. The current preview has no analytics, CMS connection, map tiles, chat service, form backend or live inventory synchronization.

The Neiden wave video is bundled as an alternate hero. Set `content.hero.video` to its local asset URL to enable it. The default landscape treatment is chosen for the intended real estate use.

## Verification

```sh
npm test
npm run verify
```

See `docs/QA.md` for browser checks, actual limitations and screenshots. See `docs/EFFECT-SOURCE-MAP.md` for exact reference settings versus authored adaptations.

## Portability

To add only effects, copy `site/effects/` and import `mountMotion` from `motion-kit.mjs`. Read `integration/devbhoomi-motion.mjs` first: the inspected Devbhoomi site already loads Lenis. One scroll owner and one RAF are essential.

For a full template mount, import `mountRealEstate` from `site/real-estate/template.mjs` into an empty element. An existing router can supply `onNavigate`; a host enquiry flow can supply `onEnquiry`. Neither is connected by default. Keep the relative `real-estate/` and `effects/` folder layout, or update the relative imports.

Use `site/effects/demo.html` to inspect the motion kit independently. Static production hosting needs fallback/rewrite rules for these client routes; the bundled Node server provides that for local preview. Preserve the real site's server-rendered metadata, structured data, canonical URLs and content when integrating.

Third-party provenance and notices are in `docs/ASSETS-AND-NOTICES.md` and alongside the assets.
