import Lenis from './vendor/lenis.mjs';
import { motionConfig, reducedMotion } from './motion-config.mjs';

let activeScroller = null;
export function getScroller() { return activeScroller; }

/** One Lenis owner per module. Norda supplies its existing RAF; standalone sites use autoRaf. */
export function createScroller({ autoRaf = true, ...overrides } = {}) {
  activeScroller?.destroy();
  const config = { ...motionConfig.scroll, ...overrides };
  const duration = () => innerWidth >= config.wideBreakpoint ? config.wideDuration : config.duration;
  const scroller = new Lenis({
    duration: duration(), easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)),
    wheelMultiplier: config.wheelMultiplier, touchMultiplier: config.touchMultiplier,
    orientation: 'vertical', gestureOrientation: 'vertical',
    smoothWheel: motionConfig.enabled && !reducedMotion(), syncTouch: false,
    infinite: false, autoResize: true,
    prevent: node => Boolean(node.closest?.('[data-motion-native], textarea, select, [contenteditable="true"]')),
  });
  activeScroller = scroller;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, destroyed = false;
  const resize = () => { scroller.options.duration = duration(); scroller.resize(); };
  const preference = () => {
    scroller.scrollTo(scroller.actualScroll, { immediate: true });
    scroller.options.smoothWheel = motionConfig.enabled && !media.matches;
  };
  const raf = time => { if (destroyed) return; scroller.raf(time); frame = requestAnimationFrame(raf); };
  addEventListener('resize', resize, { passive: true });
  media.addEventListener('change', preference);
  if (autoRaf) frame = requestAnimationFrame(raf);
  const originalDestroy = scroller.destroy.bind(scroller);
  scroller.destroy = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    removeEventListener('resize', resize);
    media.removeEventListener('change', preference);
    originalDestroy();
    if (activeScroller === scroller) activeScroller = null;
  };
  return scroller;
}
