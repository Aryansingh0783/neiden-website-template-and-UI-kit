# Go-live checklist (phase 9, only after the client approves)

This is the list of everything that changes when this site replaces devbhoomirealtors.com. Nothing here has been done.

## Search
1. Set `SEO_INDEX=1` (and `SITE_URL=https://devbhoomirealtors.com` if the domain differs) on the Vercel **production** environment. Without it every page is `noindex` and `robots.txt` blocks all crawlers.
2. Point the domain at Vercel and make `www.devbhoomirealtors.com` redirect to the bare domain (Search Console shows `www` currently answers 200 and creates alternate pages).
3. Redirects are already in `vercel.json` and tested (`tools/seo.test.mjs`): every old Hindi address `/hi/...` goes to its English page, `/index.html` and `/x/index.html` go to the clean address, `/query.html` goes to `/contact/`, and the two renamed plots keep their old links working. All 38 English addresses on the live site exist unchanged here.
4. In Search Console submit `https://devbhoomirealtors.com/sitemap.xml`, then use URL Inspection on the home page, a plot page and an area page. Removing the Hindi pages will show as "Page with redirect" for a while; that is expected.
5. The Hindi pages will stop ranking; their English twins keep the English rankings. This was the owner's decision.

## Things the live site has that this site does not
- `/stats/` (the private dashboard), `/leads/` (the enquiry inbox, behind Cloudflare Access) and the Cloudflare Worker that serves them and `/api/enquiries`. The old `/an` to `/stats/` redirect was left out for that reason. Either keep the Worker running on a sub-domain, or rebuild those two pages on Vercel before switching.
- The enquiry saving: set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `OFFICE_EMAIL` on the production project (see `api/enquiries.js`). Never set them on staging.
- The assistant: set `AI_API_KEY` (see `docs/CONVERSION-PHASES.md`).

## Before switching
- Run `npm test` and `npm run verify`.
- Open the production preview signed out of Vercel and check the home page, a plot, the contact form and the assistant on a phone.
- Keep the old site's repository untouched until the new domain has served traffic for a few days, so it can be restored in minutes.
