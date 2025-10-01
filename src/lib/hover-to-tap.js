/**
 * NOTE: This scrit was AI Generated
 * Makes :hover styles apply on-finger-down for touch devices
 *
 * Notes / Limitations:
 * - The function mutates DOM classList and installs global event listeners;
 *   it does not return a teardown function or remove the listeners automatically.
 * - Only hover classes on the targeted interactive element itself are considered;
 *   it does not traverse or apply hover-derived classes from descendants.
 * - Hover token parsing assumes colon-separated modifiers (e.g. "sm:hover:bg-red-500")
 *   and extracts the segment after the last "hover" token.
 *
 * Usage:
 * - Call once during initialization (for example on app mount or DOMContentLoaded)
 *   to enable touch-friendly hover behavior.
 *
 * @function convertHoverToFingerDown
 * @returns {void} No return value; side effects include adding/removing classes
 * and registering global event listeners when running on touch-primary devices.
 */
export default function convertHoverToFingerDown() {
  let activeEl = null;
  let added = [];

  function isInteractive(el) {
    if (!el || !(el instanceof Element)) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "button" || tag === "a") return true;
    const role = el.getAttribute("role");
    if (role === "button") return true;
    return false;
  }

  function findInteractive(start) {
    let el = start instanceof Element ? start : null;
    while (el) {
      if (isInteractive(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function collectHoverClasses(el) {
    const classes = Array.from(el.classList);
    const toAdd = [];
    for (const cls of classes) {
      if (cls.includes("group-hover:") || cls.includes("peer-hover:")) continue;
      if (cls.includes("hover:")) {
        const parts = cls.split(":");
        const hoverIndex = parts.lastIndexOf("hover");
        if (hoverIndex !== -1 && hoverIndex < parts.length - 1) {
          const base = parts.slice(hoverIndex + 1).join(":");
          if (base && !el.classList.contains(base)) toAdd.push(base);
        }
      }
    }
    return toAdd;
  }

  function cleanup() {
    if (activeEl && added.length) {
      for (const c of added) activeEl.classList.remove(c);
    }
    activeEl = null;
    added = [];
  }

  function onPointerDown(e) {
    cleanup();
    const target = e.target;
    const el = findInteractive(target);
    if (!el) return;
    const toAdd = collectHoverClasses(el);
    if (!toAdd.length) return;
    activeEl = el;
    added = toAdd;
    for (const c of toAdd) el.classList.add(c);
  }

  function onPointerEnd() {
    cleanup();
  }

  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointerup", onPointerEnd, true);
  document.addEventListener("pointercancel", onPointerEnd, true);
  document.addEventListener("pointerleave", onPointerEnd, true);
  document.addEventListener("touchend", onPointerEnd, true);
  document.addEventListener("touchcancel", onPointerEnd, true);
  window.addEventListener("blur", onPointerEnd);
}
