// ============================================================
// FORGE OS — EVENT RIPPLE
//
// The architecture already propagates: every room folds the same log, so a
// decision is visible everywhere. What was missing is that propagation being
// FELT. A user approving a specification saw a local confirmation, navigated
// elsewhere, and found different numbers — with nothing connecting cause to
// effect in their experience.
//
// The ripple carries no data. Only the signal that something significant
// happened and which domains it touched. State still comes exclusively from
// the projection; this cannot become a second source of truth.
// ============================================================
import { useEffect } from "react";
import { useForgeActivity } from "../ActivityEngine.jsx";

import { RIPPLE_TRIGGERS } from "./triggers.js";
export { RIPPLE_TRIGGERS };

// Module-level pub/sub so it survives re-renders and needs no provider.
const listeners = new Set();
export function notifyRipple(r) { listeners.forEach((fn) => { try { fn(r); } catch {} }); }
export function useRippleListener(onRipple) {
  useEffect(() => { listeners.add(onRipple); return () => listeners.delete(onRipple); }, [onRipple]);
}

/** Mount once, high in the tree: turns significant events into ripples. */
export function useEventRipple() {
  const { subscribe } = useForgeActivity();
  useEffect(() => {
    if (typeof subscribe !== "function") return;
    return subscribe((event) => {
      const t = RIPPLE_TRIGGERS[event?.type];
      if (!t) return;
      notifyRipple({ ...t, id: event.eventId ?? `${event.type}-${event.at}`,
        type: event.type, subject: event.specification || event.component || event.machine || event.mission || null,
        at: event.at ?? Date.now() });
    });
  }, [subscribe]);
}
