/** Editable Neiden motion preset. Values verified against its published homepage. */
export const motionConfig = {
  enabled: true,
  scroll: { duration: 4, wideDuration: 3, wideBreakpoint: 1620, wheelMultiplier: 1.1, touchMultiplier: 1 },
  edgeBlur: { enabled: true, height: 120, maxBlur: 20, layers: 8, fadeRange: 70, saturation: 120, zIndex: 8, hideAtFooter: true },
  reveal: { enabled: true, blur: 10, duration: 1200, stagger: 60, threshold: 0.08 },
  navigation: { enterDuration: 500, exitDuration: 200, scale: 1.1, easing: [0.62, 0.01, 0.54, 1] },
  menuBlur: 8,
};

export function reducedMotion() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }

/** Framer router configuration. Read at application startup. */
export function framerNavigationTransition() {
  const reduced = reducedMotion() || !motionConfig.enabled;
  const { navigation: n } = motionConfig;
  const transition = duration => ({ type: 'tween', delay: 0, duration: reduced ? 0 : duration / 1000, ease: n.easing });
  return {
    enter: { opacity: reduced ? 1 : 0, rotate: 0, rotate3d: false, rotateX: 0, rotateY: 0, scale: reduced ? 1 : n.scale, x: '0px', y: '0px', transition: transition(n.enterDuration) },
    exit: { opacity: reduced ? 1 : 0, rotate: 0, rotate3d: false, rotateX: 0, rotateY: 0, scale: 1, x: '0px', y: '0px', transition: transition(n.exitDuration) },
  };
}
