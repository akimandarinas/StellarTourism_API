
export function applyReducedMotion(element, enabled = true) {
  if (!element) return

  if (enabled) {
    element.classList.add("reduce-motion")
  } else {
    element.classList.remove("reduce-motion")
  }
}

export function getAnimationDuration(defaultDuration, respectReducedMotion = true) {
  if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Math.min(defaultDuration * 0.1, 100)
  }

  return defaultDuration
}

export function createAccessibleAnimation(animationFn, fallbackFn) {
  return (...args) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return fallbackFn ? fallbackFn(...args) : null
    }

    return animationFn(...args)
  }
}
