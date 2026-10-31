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
| 2 | Listings | Property list with filters and sorting, full detail pages with photos, videos, highlights, WhatsApp per plot | **Built, waiting for approval** |
| 3 | The other pages | Areas (with their own pages), Cottages, Services, About, Guide, Testimonials (6 real), Updates, Referral, legal pages | Not started |
| 4 | Forms and contact | Enquiry, valuation and referral forms, WhatsApp flow, map, mobile contact bar | Not started |
| 5 | Design pass | `impeccable` critique and polish across every page, `unslop` over all wording, image and video optimisation, accessibility and performance audit | Not started |
| 6 | Assistant rebuild | New assistant on a free AI API behind a Vercel function (the key never reaches the browser), answers grounded in the listing data, refuses invented prices and advice | Not started |
| 7 | Search readiness | Real HTML per page, own title, description and canonical on each, sitemap, structured data, correct 404, `noindex` while on Vercel | Not started |
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

## Re-importing the data

```sh
node tools/import-devbhoomi.mjs <path to a Devbhoomi-realtors checkout>
```

Add `--videos` in phase 2 to copy the listing videos as well.

## Previews on Vercel

Vercel project: import this GitHub repo, Framework Preset **Other**, Build Command empty, Output Directory `site`. `vercel.json` handles the rest. Each branch and pull request then gets its own preview link. Previews are private by default (Vercel sign-in required).

Note: `main` still holds the original template and Vercel serves it through `server.mjs`. Branches that carry `vercel.json` (from phase 1 on) are served as a static site from `site/` with no server. Phase previews come from their own branch deployments, not from the main URL.
