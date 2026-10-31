# Paste this into Claude with the extracted folder attached/open

You are working on the supplied Neiden-style real estate frontend. Start by reading `README.md`, `docs/DEVBHOOMI-INTEGRATION.md`, `docs/EFFECT-SOURCE-MAP.md` and `docs/QA.md`.

The user originally requested the Nordå reference clone, then explicitly changed the direction toward Neiden's visual language, scroll smoothness, blur and navigation. The newest instruction is to tailor the reusable template for eventual integration with **devbhoomirealtors.com**, without integrating or changing that live website yet.

The current deliverable uses neutral `acre.` sample branding. It has sample land/cottage records and illustrative stock photographs, not live Devbhoomi inventory. Keep these visibly identified as examples until actual verified records and images are supplied. Do not infer listing facts, legal rules, testimonials, contacts or prices from the demo. No external forms or contacts are connected.

Run `npm start` and inspect http://127.0.0.1:4173/. Run `npm test` and `npm run verify`. There is no dependency installation step.

When the user later asks for integration:

1. Inspect the actual target checkout and its data schema. The inspected public website loads an existing Lenis vendor script and several motion scripts; don't install a second scroll loop over them.
2. Prefer adapting the existing site with the isolated motion modules and reusable sections. Preserve existing listing URLs, filters, maps, Hindi content, WhatsApp flow, seller form, referral/testimonial/update pages and business records.
3. Use the reference preset in `site/effects/motion-config.mjs`. Destroy the host's old Lenis/RAF before enabling this package's scroll controller. If retaining the host Lenis, use `mountMotion({scroll:false})` for the blur/reveal layer and tune the host scroller separately.
4. Content is in `site/real-estate/content.mjs`, visual CSS in `theme.css`, sections in `components.mjs`, pure data functions in `model.mjs`, application lifecycle in `template.mjs`. `integration/` contains examples and a data contract; examples are not evidence of the real host schema.
5. Keep the polished typography, large imagery, compact navigation, progressive lower-edge blur and smooth page transitions. Adapt content density to land search; keep listing facts and enquiry controls readable.
6. Connect actual enquiries only when asked. A configured WhatsApp recipient produces an explicit user-click link; it never sends a message automatically. Replace the preview privacy text with the host's policy.
7. Verify desktop, tablet, mobile, keyboard, reduced motion, history restoration, listing filters and forms. Keep one animation-frame owner. Preserve server-rendered SEO and canonicals on the actual site.

The original Nordå full reproduction is a separate preserved ZIP, `NORDA-CLONE-FULL-PACKAGE.zip`. Its pixel/layout comparison evidence belongs to the original reproduction. It does not certify this redesigned template as a pixel-identical Neiden or Devbhoomi clone.

Current scope is local preparation and handoff. No live deployment, domain change, content migration or production enquiry connection has been performed.
