# Patch notes

Fixes made after a full code review of the original import (commit `75b0079`). Behaviour, content, media and visual style are unchanged except where listed.

## Bugs

- **Phone validation did nothing.** The pattern `[+0-9 ()-]{7,20}` is invalid under the `v` flag browsers now use for `pattern`, so Chrome ignored it and accepted letters. It is now `[+0-9 \(\)\-]{7,20}`. (`site/real-estate/components.mjs`, `enquiry()`)
- **Unclosed `div` in `faq()`.** `.estate-service-layout` was never closed on the home, about and guide pages. Browsers repaired it silently. (`components.mjs`)
- **`crypto.randomUUID()` crashed on plain http.** It needs a secure context. A fallback id is used instead. (`site/real-estate/template.mjs`, `uid()`)
- **A bad WhatsApp number threw an unhandled error** in the submit handler. It now shows a short note and the draft stays usable. (`template.mjs`)
- **"NaN" and "₹0" in listings.** A record with an unknown unit or no rate now shows "Size to confirm", "On enquiry" or "Ask for details". (`components.mjs`: `sqftOf`, `perSqft`, `sqftText`, `price`)

## Design and accessibility

- **Small text.** Every text size under 11px (8, 9 and 10px: 18 declarations) is now 11px. Measured before: 201 small text elements across the pages at two widths. After: 0.
- **Tap targets.** Footer links, the scroll cue, text links and header links are at least 24px tall (WCAG 2.5.8). Before: 248 undersized targets. After: 0.
- **Hero button hidden in the blur strip.** The bottom edge blur is 120px tall, and on a 768 to 800px-high window the hero's description and button sat inside it. The hero is no longer taller than the window on desktop, has more bottom padding, and the giant wordmark is capped at `31vh`. The button now clears the strip at 1280×800, 1366×768, 1024×768, 1440×900 and 1920×1080.

## Tests

- New `tools/render.test.mjs`: every route renders balanced HTML, every `pattern` attribute compiles with the `v` flag and the phone pattern accepts and rejects the right values, and bad data never prints NaN or a zero rate. All three tests fail on the original code.
- `npm test` now runs both test files (7 tests).

## Not changed

- `wave.mp4`, `hand.woff2` and the Neiden-derived styling were left as they are.
- `mountMotion` is still a singleton: mounting two templates on one page shares one effects instance.
- `npm run verify` rewrites `docs/verification.json` each run, so `SHA256SUMS.txt` goes stale after running it. Regenerate the sums afterwards.
- Page titles still use " — " (an em dash).
- The template renders only with JavaScript, uses one meta description for all routes and has no Hindi. See the review for the integration implications.
