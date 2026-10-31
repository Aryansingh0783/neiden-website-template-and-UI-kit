# Verification of the tailored template

Run on 10 October 2026. This report covers `NEIDEN-REALESTATE-TEMPLATE`, not the earlier Nordå pixel comparison.

## Automated checks

- `npm test`: four tests covering comparable price sorting, compound filters, unit conversion/invalid values and enquiry/recipient handling.
- `npm run verify`: syntax checks for every shipped site module, all 16 preview routes, local asset availability, a genuine HTTP 404 for unknown routes, HTTP 405 for form POSTs, and MP4 byte-range support.
- Results are recorded in `verification.json`. The shipping ZIP is independently checked for CRC, file inventory and SHA-256 equality with its source folder.

## Browser checks

At desktop 1440×900, tablet 960×900 and mobile 390×844:

- Desktop and mobile home layouts visually inspected; screenshots saved.
- All 16 routes opened directly at mobile size: one H1 per page, no horizontal overflow, no failed loaded images. Results: `mobile-route-checks.json`.
- Navigation through the header, expanded menu, property cards, property enquiry links and footer.
- Combined Pauri + Sold filter produced the sold sample. Devprayag + Sold produced the empty state; clearing restored six cards.
- Low-to-high rate sorting placed the nali/gaj records in comparable price order and unpriced records last.
- A detail enquiry preserved the selected property ID in the local form URL/field.
- A seller enquiry was filled with test-only values and produced a local draft. No recipient link appeared while contact configuration was null.
- Two nali converted to 480 gaj and 4,320 sq ft, with the corresponding sq m value.
- Expanded menu locked the page's scroll owner and hid the progressive blur. Escape closed it and restored scrolling.
- Back navigation restored the property list query and its scroll position. Smooth anchors move keyboard focus to their target.
- A same-page anchor returned to its exact pre-click 417 px position on browser Back; the target landed 70 px below the header. Reloading a filtered listing retained its area and two matching results.
- At 1680 px width the preset used 3 seconds; below 1620 px it used 4 seconds.
- Emulated reduced motion disabled smooth wheel behavior and hid the edge blur. Footer intersection also hid the blur in normal mode.
- Eight blur layers and one owned scroll controller were present in the running template.
- The wheel comparison against live Neiden settled at the same 550 px displacement. Raw samples and timing caveats are in `scroll-trace.json` and `EFFECT-SOURCE-MAP.md`.
- The independent motion-only demo changed its content through the page-transition API and retained all eight blur layers.
- The final inspected route had no browser console errors and no cross-origin resource requests.

Screenshots are in `screenshots/`. Some listing/form screenshots were captured after operating controls, so they show a scrolled state rather than the top of the page.

## Limits

- Chromium-based in-app browser testing and responsive emulation; no claim of physical-device, Safari or Firefox testing.
- No live Devbhoomi data, map, bilingual content, assistant, external enquiry endpoint, analytics or deployment was connected.
- The stock imagery and sample prices are demonstration content. The geography selectors prepare the structure for Devbhoomi; the photographs do not establish property locations.
- Matching scroll settings and measured trajectories do not prove identical frame timing on every device. Text reveals and hover treatments are authored adaptations, described in the effect map.
- The built-in local server is for preview. Production hosting, SEO, host-router behavior and real form delivery must be checked in the actual target checkout when integration is requested.
