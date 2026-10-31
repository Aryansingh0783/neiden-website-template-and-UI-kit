import { motionConfig, reducedMotion } from './motion-config.mjs';
import { createScroller, getScroller } from './scroll-controller.mjs';
export { motionConfig, createScroller, getScroller };

let mounted = null;
function ensureStyles() {
  const href = new URL('./motion-kit.css', import.meta.url).href;
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === href)) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.append(link);
  }
}

/** Framework-independent effects. scroll:false adopts a host application's existing RAF/controller. */
export function mountMotion({ scroll = true, anchorNavigation = true, revealSelector = '[data-motion-reveal]', footerSelector = 'footer', ...overrides } = {}) {
  if (mounted) return mounted;
  ensureStyles();
  const config = { ...motionConfig, ...overrides,
    edgeBlur: { ...motionConfig.edgeBlur, ...overrides.edgeBlur },
    reveal: { ...motionConfig.reveal, ...overrides.reveal },
    navigation: { ...motionConfig.navigation, ...overrides.navigation } };
  const ownedScroller = scroll && config.enabled ? createScroller(config.scroll) : null;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const transparency = matchMedia('(prefers-reduced-transparency: reduce)');
  const edge = document.createElement('div');
  edge.className = 'motion-edge-blur'; edge.setAttribute('aria-hidden', 'true');
  edge.style.height = `${config.edgeBlur.height}px`; edge.style.zIndex = String(config.edgeBlur.zIndex);
  for (let index = 1; index <= config.edgeBlur.layers; index++) {
    const layer = document.createElement('div');
    const blur = ((index / config.edgeBlur.layers) ** 2 * config.edgeBlur.maxBlur).toFixed(1);
    const start = ((index - 1) / config.edgeBlur.layers * config.edgeBlur.fadeRange).toFixed(2);
    const end = (index / config.edgeBlur.layers * config.edgeBlur.fadeRange).toFixed(2);
    layer.style.backdropFilter = layer.style.webkitBackdropFilter = `blur(${blur}px) saturate(${config.edgeBlur.saturation}%)`;
    layer.style.maskImage = layer.style.webkitMaskImage = `linear-gradient(to bottom, transparent 0%, transparent ${start}%, black ${end}%, black 100%)`;
    edge.append(layer);
  }
  document.body.append(edge);
  const seen = new WeakSet(), completed = new WeakSet(), pending = new Set(), animations = new Map();
  const footers = new Map();
  let paused = false, frame = 0, disposed = false, navigationBusy = false;
  const edgeVisibility = () => {
    edge.hidden = !config.enabled || !config.edgeBlur.enabled || media.matches || transparency.matches || paused ||
      (config.edgeBlur.hideAtFooter && [...footers.values()].some(Boolean));
  };
  const footerObserver = new IntersectionObserver(entries => {
    for (const entry of entries) footers.set(entry.target, entry.isIntersecting);
    edgeVisibility();
  }, { threshold: 0 });
  const reveal = element => {
    if (completed.has(element)) return;
    completed.add(element); pending.delete(element); revealObserver.unobserve(element);
    if (media.matches || !config.enabled || !config.reveal.enabled) return;
    const targets = element.hasAttribute('data-motion-stagger') ? [...element.children] : [element];
    targets.forEach((target, index) => {
      const underlying = getComputedStyle(target).filter;
      const base = underlying === 'none' ? '' : underlying + ' ';
      const animation = target.animate([
        { filter: `${base}blur(${config.reveal.blur}px)` }, { filter: `${base}blur(0px)` }
      ], { duration: config.reveal.duration, delay: index * config.reveal.stagger, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'none' });
      animations.set(target, animation);
      animation.finished.catch(() => {}).finally(() => { if (animations.get(target) === animation) animations.delete(target); });
    });
  };
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting && entry.target.getBoundingClientRect().width > 0) reveal(entry.target);
  }, { threshold: config.reveal.threshold, rootMargin: '0px 0px -6% 0px' });
  function refresh() {
    if (disposed) return;
    for (const [element] of footers) if (!element.isConnected) { footerObserver.unobserve(element); footers.delete(element); }
    for (const element of document.querySelectorAll(footerSelector)) if (!footers.has(element)) { footers.set(element, false); footerObserver.observe(element); }
    for (const element of pending) if (!element.isConnected) { revealObserver.unobserve(element); pending.delete(element); }
    if (revealSelector) for (const element of document.querySelectorAll(revealSelector)) {
      if (seen.has(element) || element.closest('[data-motion-skip]')) continue;
      seen.add(element); pending.add(element); revealObserver.observe(element);
    }
    for (const [element, animation] of animations) if (!element.isConnected) { animation.cancel(); animations.delete(element); }
    getScroller()?.resize(); edgeVisibility();
  }
  const scheduleRefresh = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; refresh(); }); };
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.querySelector('#main') || document.body, { childList: true, subtree: true });
  const preference = () => { for (const animation of animations.values()) animation.cancel(); animations.clear(); edgeVisibility(); };
  media.addEventListener('change', preference); transparency.addEventListener('change', preference);
  addEventListener('resize', scheduleRefresh, { passive: true });

  const anchors = event => {
    if (!anchorNavigation || !scroll || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let target; try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    const complete = () => {
      if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true }); }
      target.focus({ preventScroll: true });
    };
    history.pushState(null, '', url.hash);
    const offset = -(parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    if (getScroller()) getScroller().scrollTo(target, { immediate: media.matches, offset, onComplete: complete });
    else { target.scrollIntoView(); complete(); }
  };
  document.addEventListener('click', anchors);
  refresh();
  mounted = {
    config,
    get scroller() { return getScroller(); },
    get state() { return { edgeVisible: !edge.hidden, blurLayers: edge.childElementCount, reducedMotion: media.matches, pendingReveals: pending.size, activeReveals: animations.size, duration: getScroller()?.options.duration, wheelMultiplier: getScroller()?.options.wheelMultiplier, ownsScroller: Boolean(ownedScroller) }; },
    refresh,
    setOverlayOpen(open) { paused = open; edgeVisibility(); },
    /** Host router owns URL/history. Pass its DOM update as the callback, and a page container outside persistent navigation. */
    async transitionPage(update, container = document.querySelector('main')) {
      if (navigationBusy) return false;
      navigationBusy = true;
      let animation;
      try {
        if (!container || media.matches || !config.enabled) { await update(); refresh(); return true; }
        const n = config.navigation, easing = `cubic-bezier(${n.easing.join(',')})`;
        animation = container.animate([{ opacity: 1 }, { opacity: 0 }], { duration: n.exitDuration, easing, fill: 'forwards' });
        await animation.finished;
        await update(); animation.cancel();
        animation = container.animate([{ opacity: 0, transform: `scale(${n.scale})` }, { opacity: 1, transform: 'scale(1)' }], { duration: n.enterDuration, easing, fill: 'none' });
        await animation.finished; refresh(); return true;
      } finally { animation?.cancel(); navigationBusy = false; }
    },
    destroy() {
      if (disposed) return;
      disposed = true; cancelAnimationFrame(frame);
      observer.disconnect(); footerObserver.disconnect(); revealObserver.disconnect();
      for (const animation of animations.values()) animation.cancel();
      animations.clear(); pending.clear(); footers.clear(); edge.remove();
      document.removeEventListener('click', anchors); removeEventListener('resize', scheduleRefresh);
      media.removeEventListener('change', preference); transparency.removeEventListener('change', preference);
      ownedScroller?.destroy(); mounted = null;
    }
  };
  return mounted;
}
