/** COPY EXAMPLE, not installed on the live site.
 * Load from your own host after reviewing its existing Lenis/motion owners.
 * Pass replaceScroller:true only AFTER destroying its existing Lenis instance/RAF.
 */
import { mountMotion } from '../site/effects/motion-kit.mjs';
export function mountDevbhoomiMotion({replaceScroller=false,revealSelector='[data-motion-reveal]',footerSelector='footer'}={}) {
  return mountMotion({scroll:replaceScroller,revealSelector,footerSelector});
}
// Keep the existing Lenis while adopting only blur/reveal:
// const effects = mountDevbhoomiMotion();
// Your router can use: await effects.transitionPage(() => renderNextPage(), pageElement);
// On unmount: effects.destroy();
