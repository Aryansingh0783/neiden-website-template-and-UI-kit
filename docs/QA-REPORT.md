# QA report (phase 8)

Run on 31 October 2026 against the build of the phase 7 branch (`npm run build`, 39 pages plus the 404 page), served locally.

## Results

| Check | Method | Result |
|---|---|---|
| Every page loads at phone (390), tablet (768) and desktop (1440) width | Playwright crawl, 120 page loads | 0 script errors, 0 console errors, 0 failed requests |
| Accessibility | axe-core, WCAG 2.0 to 2.2 AA plus best practice, 80 runs | 0 violations |
| Sideways scrolling | every page at 390, 768, 1440 | none |
| Reflow at 320 px wide (WCAG 1.4.10) | every page | no sideways scrolling |
| Text enlarged to 200 percent | home, plots, contact, valuation, guide | layout holds |
| Broken internal links | every link on every page | 0 |
| Headings and images | one h1 per page, alt text on every image | 0 problems |
| Keyboard | Tab order, skip link, focus ring on 14 stops, menu open and close with Escape, focus returns | passes |
| Reduced motion | stats show final numbers, hero video paused, no errors | passes |
| No JavaScript | every page keeps its heading, text and navigation | passes |
| Filters and sort | deep link `?area=pauri&status=Available&sort=price-low` | 6 plots, cheapest first |
| Speed on a laptop | largest paint, layout shift | under 0.5 s, under 0.08 |
| Speed on a slow phone (150 ms delay, 1.6 Mbps, 4 times slower CPU) | home, plots, contact | home 1.7 s, others under 0.9 s |
| Design detector (impeccable) | 16 pages at two widths, phase 5 | clean apart from two false readings of the blur effect |
| Automated tests | `npm test` | 56 pass |
| Repository check | `npm run verify` | passes |

The audit scripts are in `tools/audit/` (they need Playwright and axe-core installed on the machine; see the first lines of each file).

## What this report does not prove
- **Only Chromium was available.** Safari and Firefox were not tested. Check the site once on an iPhone and on a Firefox desktop before launch.
- **Speed was measured on a simulated slow phone, not the real Vercel network.** Run the Vercel preview through PageSpeed Insights once it is public.
- **The assistant has never answered a real question,** because no AI key has been added. Its safety checks are tested with a pretend server only.
- **Enquiry saving has never run against a real database.** It is tested with a fake one.
- **Staging is hidden from Google on purpose** (`noindex`). Search Console results only exist after launch.
- Third-party content (the Google map, WhatsApp links) was not tested for availability.

## Known content gaps (from the live site's own data, left as written)
- 19 of 20 plots have the aspect "To confirm"; 13 have a view of "Ask us" or "To confirm"; 6 have road access "Ask us"; 2 available plots are priced on enquiry; 4 plots have no stated size.
- Every plot has one photograph; 11 have a video. The videos are small (about 400 by 720 pixels) and look soft on a large screen.
- Some sold plots' write-ups still quote a price in the text.
- The handwritten font and the Neiden sample video are third-party reference assets with no commercial licence yet (see `docs/ASSETS-AND-NOTICES.md`). The owner said they will license them. The sample video is not shipped; the font is.
