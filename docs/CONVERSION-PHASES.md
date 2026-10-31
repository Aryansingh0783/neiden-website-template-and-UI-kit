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
| 3 | The other pages | Areas (with their own pages), Cottages, Services, About, Guide, Testimonials (6 real), Updates, Referral, legal pages | **Approved by owner** |
| 4 | Forms and contact | Enquiry, valuation and referral forms, WhatsApp flow, map, mobile contact bar | **Approved by owner** |
| 5 | Design pass | `impeccable` critique and polish across every page, `unslop` over all wording, image and video optimisation, accessibility and performance audit | **Approved by owner** |
| 6 | Assistant rebuild | New assistant on a free AI API behind a Vercel function (the key never reaches the browser), answers grounded in the listing data, refuses invented prices and advice | **Built, waiting for approval. Needs an API key to go live** |
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

## Phase 4 record

- Three forms, with the live site's own fields and wording: **What is your land worth** (name, phone, village, size in nali or sq ft, type, road access, document status, price, notes), **Refer a friend** (you, your friend, when they could visit) and a **contact message** form (name, phone, interested in, area, budget, message; names the plot when it is opened from a plot page).
- Every form checks the phone number as an Indian mobile (10 digits starting 6 to 9), shows a live preview of the exact WhatsApp message, has a hidden honeypot field, and on submit opens WhatsApp with the message filled in and goes to `/thank-you/`. The size line carries both nali and sq ft.
- Only the valuation form also posts to `/api/enquiries`, as on the live site. The referral and contact forms are WhatsApp only (the live backend has no column for them).
- `api/enquiries.js` is a Vercel function ported from the live Worker (same fields, length limits, honeypot, 5 per 10 minutes rate limit, email after the save). **It does nothing until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set on the Vercel project, and the staging project must not get the live keys** (answers 503 and the form carries on with WhatsApp). Use a separate test database if the owner wants to try storage before launch. Go-live step: set the live variables on the production project (`RESEND_API_KEY`, `RESEND_FROM`, `OFFICE_EMAIL` as well, and run `supabase/enquiries.sql` from the live repo).
- Mobile bottom bar (WhatsApp and Call) on every page, and a lazy-loaded Google map on the contact page (the live site's embed).
- Tests: 43 pass, including `tools/forms.test.mjs` (form fields, phone check, message text, and the API with a fake database).

## Phase 5 record

Audit tools: the `impeccable` detector (rendered pages at 1440 and 390 wide), `axe-core` (WCAG 2.0 to 2.2 AA and best practice), and a Playwright run for layout shift, load time, overflow and console errors.

- **Before:** about 150 detector findings on the pages sampled (text contrast on the grey labels and the red accent, 11px text, orphaned last words, 85+ character lines, an all-caps footer line, 130px headings, a skipped heading level, a 1.9:1 light-on-light process list on Services). axe reported heading order and landmark problems.
- **After:** axe reports 0 violations on 19 pages at both widths. The detector's remaining notes are the measure on a couple of lead paragraphs and two readings caused by the bottom edge-blur effect passing over small red numerals (the numerals themselves are 5.3:1).
- **Fixes:** text red darkened to `#c4291d` (the bright `#ec4134` stays for fills, borders and the hero script); grey labels `#5f5f5b`; every text size is now 12px or more; `text-wrap: pretty` and `balance`; reading measure about 56ch; page headings capped at 96px (72px for long titles); long kickers in sentence case; footer line in sentence case; plot list gets an h2; heading levels never skip; callouts use `role="note"` and the price card is no longer a second landmark.
- **Wording (unslop):** removed the template slogans ("Same land. Different units.", "A little clarity", "A different direction."), straight quotes everywhere, no em dashes anywhere (tested). The live site's own copy was left as written.
- **Performance:** on a local build every page measured LCP under 250 ms and layout shift under 0.03, no horizontal overflow, no console errors, no failed requests. Real network numbers need the Vercel preview. The build no longer ships the template demo page, the unused 14 MB sample video or the internal provenance notes (`NOT_SHIPPED` in `tools/build.mjs`). Photographs are re-encoded by the importer when that saves 15 percent or more (`tools/optimize-image.mjs`).
- **Left alone on purpose (owner decision):** the bracketed kickers with section numbers on the home page ("[ 01 DEVBHOOMI REALTORS ]") come from the Neiden design and the owner approved them. The impeccable guidance treats numbered kickers as a pattern to remove; say the word and they go. The home stats row also follows that "big number, small label" pattern but the owner asked for its count-up.
- Tests: 44 pass (`npm test`).

## Phase 6 record: the assistant

- **Panel:** an "Ask us" button on every page (above the mobile contact bar on phones) opens a chat panel. It keeps the conversation while the visitor moves between pages, closes with Escape, links plot ids to their pages, and offers WhatsApp and the phone number whenever it cannot answer.
- **Server:** `api/assistant.js` (Vercel function). It sends the visitor's last eight messages and a system prompt to a free OpenAI-compatible chat API. The key lives only in the server's environment.
- **What it knows:** only the facts built from the site's own files at request time: the office details, all 20 plots (id, name, area, status, price, access, view, page), the outsider land rules from the guide, the FAQs and the unit conversions (about 1,800 tokens, so it fits free tiers).
- **Guards:** it may not state a price, size or phone number that is not in those facts (the reply is checked in code, and replaced with a safe answer plus the phone number if it fails); no legal, tax or investment advice; no answers that exclude or favour people by religion, caste or community; instructions inside a visitor's message cannot change these rules; 600 characters per message, 12 questions per visitor per 10 minutes, 380 tokens per answer; sold plots are never offered. English only.
- **Without a key** the endpoint answers 503 and the panel says it is not switched on and shows WhatsApp and the phone number. The preview behaves this way until a key is set.
- **To switch it on** (owner action, about two minutes): create a free key with a provider, then in Vercel go to Project Settings, Environment Variables and add `AI_API_KEY`. Optional: `AI_BASE_URL` and `AI_MODEL`. Defaults are Groq (`https://api.groq.com/openai/v1`, model `llama-3.3-70b-versatile`). Other free OpenAI-compatible choices: Google AI Studio (`https://generativelanguage.googleapis.com/v1beta/openai`, model `gemini-2.0-flash`) or OpenRouter (`https://openrouter.ai/api/v1` with a `:free` model). Redeploy after adding variables. Free tiers have daily limits and the provider's terms apply to the questions visitors type.
- **Tests:** 52 pass, including `tools/assistant.test.mjs` (no key means no call, the facts cover every plot, the prompt rules, trimmed history, an invented price is replaced, bad requests, rate limit, no key in browser code). Checked in a browser with a mocked server: open, ask, link, error state, Escape, desktop and mobile. axe reports 0 violations with the panel on every page. The live answers have not been tried against a real model, because there is no key yet.

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
