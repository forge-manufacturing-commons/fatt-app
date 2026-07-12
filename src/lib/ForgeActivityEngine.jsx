// ============================================================
// FORGE ACTIVITY ENGINE
// A lightweight seed manufacturing-events system. This is not a
// news ticker — it drives cause-and-effect across Hero, Ecosystem,
// Production Rail, Command Center and Atmosphere.
//
// Event schema (per Odogwu brief §7):
//   { id, location, locationCode, actorType, component, componentCode,
//     action, status, target, tone }
//
// tone drives which subsystems light up:
//   fabricate → chassis subsystem + Effurun weld probability up
//   review    → engineering subsystem + calm inspection pulse
//   accept    → emerald confirmation + brief lock signal
//   supply    → industry subsystem + gold route
//   evidence  → verify stage on the rail
//
// Ownership: a React Context provider drives a single cycle
// timer. Consumers subscribe via useForgeActivity() and receive:
//   { event, phase, tone }
// Phase moves: idle → wake → route → register → accept → quiet.
//
// Timing discipline (§8): quiet periods matter. Total cycle ~14s
// (varies per event), of which >30% is quiet.
//
// Future path: this same schema will consume Supabase realtime
// events. For this pass everything is seed and clearly marked.
// ============================================================
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export const SEED_EVENTS = [
  { id: "E01", location: "Effurun / Warri", locationCode: "WAR", actorType: "SME",         component: "Chassis crossmember",     componentCode: "CHS-XM-004", action: "Welding in progress",       status: "In progress",  target: "chassis",     tone: "fabricate", signoff: "Engr. Adebayo",         humanRole: "WELDER",    humanVariant: "F", humanName: "Adaeze Okoro",   workshop: "Warri Fabrication Co-op" },
  { id: "E02", location: "Nnewi",           locationCode: "NNW", actorType: "SME",         component: "Steering bracket",         componentCode: "STE-BR-011", action: "Fabrication complete",      status: "Complete",     target: "chassis",     tone: "accept",    signoff: "Awaiting review",       humanRole: "WELDER",    humanVariant: "M", humanName: "Chike Nwosu",    workshop: "Nnewi Autoparts SME" },
  { id: "E03", location: "Polytechnic workshop", locationCode: "ILR", actorType: "UNI",   component: "Frame drawing",            componentCode: "FRM-DR-002", action: "Drawing check — revision received", status: "Review",       target: "engineering", tone: "review",    signoff: "Engr. Okonkwo",         humanRole: "ENGINEER",  humanVariant: "F", humanName: "Ngozi Bello",    workshop: "Ilorin Polytechnic ME Dept." },
  { id: "E04", location: "Diaspora technical review", locationCode: "DSP", actorType: "DIASPORA", component: "Frame drawing",     componentCode: "FRM-DR-002", action: "Review approved",           status: "Approved",     target: "engineering", tone: "accept",    signoff: "Engr. Musa (diaspora)", humanRole: "ENGINEER",  humanVariant: "M", humanName: "Yusuf Musa",     workshop: "NSE Houston Branch" },
  { id: "E05", location: "Lagos",           locationCode: "LAG", actorType: "INDUSTRY",    component: "Brake component",          componentCode: "BRK-CP-007", action: "Supplier match — source found", status: "Matched",   target: "energy",      tone: "supply",    signoff: "System match",          humanRole: "ENGINEER",  humanVariant: "M", humanName: "Ibrahim Danladi", workshop: "Lagos Industrial Estate" },
  { id: "E06", location: "Forge build system", locationCode: "SYS", actorType: "SYSTEM",  component: "Component evidence",       componentCode: "EVD-018",    action: "Received for review",       status: "In review",    target: "engineering", tone: "evidence",  signoff: "Queued for review",     humanRole: "INSPECTOR", humanVariant: "F", humanName: "Amina Suleiman", workshop: "Forge quality office" },
  { id: "E07", location: "Aba",             locationCode: "ABA", actorType: "SME",         component: "Body trim panel",          componentCode: "BDY-TR-009", action: "Component accepted",        status: "Accepted",     target: "body",        tone: "accept",    signoff: "Engr. Chikelu",         humanRole: "INSPECTOR", humanVariant: "M", humanName: "Uche Chikelu",   workshop: "Aba SME cluster" },
];

// One event lives across five phases with quiet in between.
// dwell times in ms; cycle total keeps activity restrained.
const PHASE_MS = { wake: 900, route: 1500, register: 1400, accept: 1200, quiet: 3400 };

const Ctx = createContext({ event: null, phase: "quiet", tone: "quiet", index: 0 });

export function ForgeActivityProvider({ children, disabled = false }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("wake");
  const timerRef = useRef(null);

  useEffect(() => {
    if (disabled) return;
    const step = () => {
      setPhase(prev => {
        const order = ["wake", "route", "register", "accept", "quiet"];
        const i = order.indexOf(prev);
        const next = order[(i + 1) % order.length];
        if (next === "wake") setIndex(k => (k + 1) % SEED_EVENTS.length);
        timerRef.current = setTimeout(step, PHASE_MS[next] || 1000);
        return next;
      });
    };
    timerRef.current = setTimeout(step, PHASE_MS.wake);
    return () => clearTimeout(timerRef.current);
  }, [disabled]);

  const value = useMemo(() => {
    const event = SEED_EVENTS[index];
    const tone = phase === "quiet" ? "quiet" : event.tone;
    return { event, phase, tone, index };
  }, [index, phase]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useForgeActivity() { return useContext(Ctx); }
