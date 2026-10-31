# Conversion plan and status

The goal: turn this template into the Devbhoomi Realtors website, as a **standalone site first**. Nothing here touches devbhoomirealtors.com. Only after the client approves the design does it replace the live site.

## Owner's rules (Aryan, 31 Oct 2026)

1. Build it here, in this repo. Show a preview after **every** phase.
2. Audit it yourself before showing a preview.
3. Before moving on, ask exactly: **"Aryan, is this phase N preview okay?"** and wait for a yes. Never start the next phase without it.
4. English only. No Hindi.
5. No dark mode.
6. The assistant stays, but it gets a full rebuild on a free AI API (phase 6).
7. Previews are hosted on Vercel.
8. Use the loaded skills. The most important are `impeccable` (design) and `unslop` (wording).
9. No go-live date. It must be 100% ready before the client sees it.
10. The Neiden video and font stay as they are. The owner will license them.
11. Content is the live site's own wording, copied rather than rewritten. Do not invent facts, prices, reviews or claims. A fact the host does not publish stays "To confirm".

## Phases

| # | Phase | What the owner sees | Status |
|---|---|---|---|
| 1 | Foundation and Home | Devbhoomi brand, header, footer, real home page, all 20 real listings loaded | **Approved by owner** |
| 2 | Listings | Property list with filters and sorting, full detail pages with photos, videos, highlights, WhatsApp per plot | **Approved by owner** |
| 3 | The other pages | Areas (with their own pages), Cottages, Services, About, Guide, Testimonials (6 real), Updates, Referral, legal pages | **Built, waiting for approval** |
| 4 | Forms and contact | Enquiry, valuation and referral forms, WhatsApp flow, map, mobile contact bar | Not started |
| 5 | Design pass | `impeccable` critique and polish across every page, `unslop` over all wording, image and video optimisation, accessibility and performance audit | Not started |
| 6 | Assistant rebuild | New assistant on a free AI API behind a Vercel function (the key never reaches the browser), answers grounded in the listing data, refuses invented prices and advice | Not started |
| 7 | Search readiness | Foundation built in phase 2 (see "SEO build"). Phase 7 is the final SEO audit: content depth per page, internal linking, image weight, Core Web Vitals, redirect map from every old URL | Foundation done, audit later |
| 8 | Full audit and client demo | Automated crawl, accessibility, speed, link checks, a checklist for the client review | Not started |
| 9 | Go live (only after client approval) | Replace the live site, keep every old URL working or redirect it, keep the enquiry backend and Search Console clean | Not started |

## Phase 1 record

- Imported the host's data: `site/real-estate/listings.mjs` (generated, do not edit) from `stats/data.json` and each listing page, plus 29 listing images.
- New content file: `site/real-estate/content.mjs` (the live site's own copy).
- Home page rebuilt with real hero footage, stats, featured plots, the belt and areas, services, turnkey cottages, the four-step process, the "from outside the state" rules, the founder, FAQs, the converter and both calls to action.
- Header and footer carry the real address, phones, emails, hours and map link.
- Removed the three European demo photos. The old demo records are kept only as test fixtures (`tools/fixtures/`).
- Other pages (areas, cottages, services, about, guide, contact, privacy) still use template wording until phases 3 and 4. Listing detail pages show real facts but are redesigned in phase 2.
- Tests: `npm test` (13), `npm run verify`.

## Phase 2 record

- Listing videos imported (11 listings, 42 MB under `site/real-estate/assets/listings/`) with `--videos`.
- Property detail page rebuilt: video or photo first, the host's full write-up, "What it has" list, spec table, price with the total for the parcel, WhatsApp button that opens the plot's own message, call link, form link, and "More in <area>" cards.
- Sold plots say so, never offer to sell the plot, and send the visitor to similar land.
- Listing page: available land first, sold dimmed, Video badge, search also matches the place name, "Ask us" road access reads "Ask about access".
- Tests: 18 pass (`npm test`), `npm run verify` passes. All 20 detail pages loaded on desktop and mobile with no console errors, failed requests or overflow.
- Known host-copy quirks kept as written: some sold plots' write-ups still quote a price in the prose, and "View" reads "Ask us" on a few.

## Phase 3 record

- 17 live pages imported as structured blocks by `tools/import-pages.mjs` into `site/real-estate/pages.mjs` (generated): About, Areas and its three area pages, Cottages, Services, Guide (From outside the state), Land valuation, Contact, Testimonials (the six real quotes, no star ratings), Updates and the railway station article (with video), Referral, Disclaimer, Privacy, Thank you.
- The live site's URLs are kept as they are (for example `/areas/kholachauri-corridor/`), so nothing needs a redirect for these pages.
- The business name now reads "Devbhoomi Realtors" in the header, menu and footer (the template's short lowercase mark was removed).
- Fixed a grey band under the home hero (the over-scaled hero image spilled below the hero).
- Forms (contact, land valuation, referral) still only prepare a draft or open WhatsApp; the real enquiry flow is phase 4. The referral page opens WhatsApp with a generic referral message until the form is built.
- `/thank-you/` is `noindex` and left out of the sitemap, as on the live site.
- Owner feedback applied: hero button reads "Get in touch with us"; the "25+" and "10+" stats count up when scrolled into view (static text without JavaScript or with reduced motion); the featured plots on the home page are Sitton Khola, Kandogal and Khirsu village (the railway station plot was removed from that row).
- Tests: 33 pass (`npm test`), including `tools/pages.test.mjs`.

## SEO build (owner's rule: build every page with search in mind)

The template was a client-side single-page app, which search engines see as an empty page until JavaScript runs. Phase 2 replaced that with a prerendered static build:

- `node tools/build.mjs` (Vercel runs it) writes real HTML to `dist/` for all 30 pages plus `404.html`, `sitemap.xml` and `robots.txt`. The browser then hydrates the same markup, so the look and behaviour are unchanged.
- Each page gets its own title, description, canonical, Open Graph and Twitter tags. Titles and descriptions are the live site's own tuned ones, imported into `site/real-estate/seo-data.mjs` (generated by the importer).
- Structured data: `RealEstateAgent` on every page, `BreadcrumbList`, `Product` plus `Offer` on listings (price only where the host states one; sold plots marked SoldOut; unpriced plots carry no offer), `FAQPage` where FAQs are shown.
- Unknown URLs now return a real 404 (the old catch-all rewrite caused soft 404s).
- **Staging is `noindex` and `robots.txt` blocks all crawlers.** At go-live set the Vercel production env vars `SEO_INDEX=1` (and `SITE_URL` if the domain differs). Canonicals already point at https://devbhoomirealtors.com.
- Tests: `tools/seo.test.mjs` (one h1, unique titles and descriptions, canonical, valid JSON-LD, alt text, every internal link resolves, noindex versus index builds).
- Known gaps for phases 5 and 7: `/about/`, `/contact/` and a few sold-plot descriptions are short (76 to 109 characters); other pages still use template body copy until phase 3; the live site's `/hi/` pages need 301 decisions at go-live.

## Re-importing the data

```sh
node tools/import-devbhoomi.mjs <path to a Devbhoomi-realtors checkout>
```

Add `--videos` in phase 2 to copy the listing videos as well.

## Previews on Vercel

Vercel project: import this GitHub repo, Framework Preset **Other**, Build Command empty, Output Directory `site`. `vercel.json` handles the rest. Each branch and pull request then gets its own preview link. Previews are private by default (Vercel sign-in required).

Note: `main` still holds the original template and Vercel serves it through `server.mjs`. Branches that carry `vercel.json` (from phase 1 on) are served as a static site from `site/` with no server. Phase previews come from their own branch deployments, not from the main URL.
