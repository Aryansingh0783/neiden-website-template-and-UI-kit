# Effects: reference, implementation and limits

Reference: [Neiden](https://neiden.framer.media/), inspected live and in its public published modules on 10 October 2026. Original starting reference: [Nordå](https://norda.framer.website/). The latest user instruction intentionally changes the visual target toward Neiden and prepares it for Devbhoomi's real estate use.

| Effect | Verified reference | Delivered implementation |
|---|---|---|
| Wheel smoothing | Lenis 1.1.9 | Exact vendored npm 1.1.9 distribution with MIT notice and provenance |
| Homepage duration | 4 seconds below 1620 px; 3 seconds at/above it | Matching responsive preset |
| Input scaling | Wheel 1.1; touch 1; smooth wheel, native touch | Matching settings; single owned RAF |
| Scroll easing | `min(1, 1.001 - 2 ** (-10*t))` | Same function |
| Progressive viewport blur | Fixed lower 120 px, 8 stacked masked layers | Reconstructed reusable DOM/CSS layers |
| Blur radii | Quadratic progression to 20 px: .3, 1.3, 2.8, 5, 7.8, 11.3, 15.3, 20 | Same radii |
| Blur masks | Direction to bottom; max blur reached over 70%; saturation 120% | Same mask progression and saturation |
| Footer behavior | Progressive blur hidden when footer intersects | IntersectionObserver threshold 0 |
| Header/menu glass | Header 7 px; overlay 8 px | Header 7 px and menu backdrop 8 px |
| Page entry | Opacity 0→1, scale 1.1→1, .5 seconds, cubic [.62,.01,.54,1] | Same timing/curve through Web Animations API |
| Page exit | Opacity 1→0, scale unchanged, .2 seconds, same curve | Same timing/curve |
| Text blur reveal | Source includes word-level 10 px blur, y movement and spring/stagger variants | Adapted to safe whole-element blur 10→0, 1.2 seconds, optional 60 ms child stagger; not the exact per-word spring |
| Hover treatment | Source includes image/text blur variants | Authored subtle image zoom/dim, blurred “view property” label and softened inactive menu links |
| Typeface/visual direction | Cal Sans, DM Sans, handwritten accent; large type, small utility text, grid lines | Locally bundled reference fonts, reworked for land/cottage content |
| Hero media | Reference monochrome wave | Wave retained as selectable local asset; default changed to landscape for real estate relevance |
| Reduced motion | Additional accessibility behavior | Native scrolling, no reveals/transitions, edge blur removed; video paused |

`motion-config.mjs` is the single settings file. The new template imports this kit directly. It does not load the Nordå compiled scroll helper or Framer runtime.

## Measured wheel comparison

At 1440×900, one 500-unit downward wheel event produced the following sampled deltas. Both recordings used the browser's actual `scrollY`; separate event/RAF scheduling means the first frame is not synchronized. These are observations, not a claim of universal frame-identical motion.

| Time | Template | Live Neiden |
|---|---:|---:|
| 100 ms | 75 px | 64 px |
| 250 ms | 184 px | 178 px |
| 500 ms | 313 px | 309 px |
| 1000 ms | 451 px | 449 px |
| 2000 ms | 533 px | 533 px |
| 4000 ms | 550 px | 550 px |

Raw samples: `scroll-trace.json`. Reference browser capture began at a different absolute page position; the table compares displacement.

## Source provenance

Public Neiden module names inspected:

- `script_main.CY4E0CFi.mjs`
- `2uQbRrDtoxfE3UZHZ-2wgMSI-vEbDwSP3FN7xx0FUAc.DVuEzT9_.mjs`

They identify the matching published build inspected at `https://neiden.framer.media/`. The progressive-blur source credits Igor Reif; this package acknowledges that reference and implements its observed mask/radius behavior independently. The original Nordå page library and its source/effect evidence are preserved in the earlier full archive.

This is an intentional Neiden-inspired real estate adaptation. It does not reproduce every Neiden page, interaction or private Framer component. It is no longer a pixel-identical Nordå homepage. The included motion settings, measured behavior and adaptation boundaries are listed here explicitly.
