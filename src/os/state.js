// ============================================================
// FORGE OS — MANUFACTURING STATE ENGINE
//
// Not a workflow engine. In manufacturing the OBJECT changes, not a
// workflow instance: raw material becomes cut, machined, inspected,
// assembled, certified, installed, retired. State is a property of the
// manufacturing object, so this engine is expressed as state graphs per
// object class rather than as process definitions.
//
// RESPONSIBILITY BOUNDARY — this engine answers exactly one question:
//   "Given what this object IS, what transition may occur?"
// It knows nothing about who is acting (that is policy.js) and nothing
// about industrial constraints (that is rules.js). Keeping the three
// apart is what stops each from growing a copy of the others.
//
// Pure. No React, no bus, no I/O. Fully testable in isolation.
// ============================================================

export class IllegalTransition extends Error {
  constructor(machineId, from, transition, allowed) {
    super(
      `[${machineId}] cannot "${transition}" from "${from}". ` +
      (allowed.length ? `Allowed: ${allowed.join(", ")}` : "No transitions are possible from this state.")
    );
    this.name = "IllegalTransition";
    this.machineId = machineId;
    this.from = from;
    this.transition = transition;
    this.allowed = allowed;
  }
}

export class UnknownState extends Error {
  constructor(machineId, state, known) {
    super(`[${machineId}] "${state}" is not a state of this object. Known: ${known.join(", ")}`);
    this.name = "UnknownState";
    this.machineId = machineId;
    this.state = state;
  }
}

/**
 * @param id         object class this graph governs, e.g. "component"
 * @param initial    the state a newly registered object holds
 * @param states     { [state]: { on: { [transition]: nextState }, terminal?: bool, means?: string } }
 */
export function createStateMachine({ id, initial, states }) {
  if (!id) throw new Error("createStateMachine: `id` is required");
  if (!states || !states[initial]) {
    throw new Error(`createStateMachine(${id}): initial state "${initial}" is not defined`);
  }
  const names = Object.freeze(Object.keys(states));

  const requireState = (s) => {
    if (!states[s]) throw new UnknownState(id, s, names);
    return states[s];
  };

  const api = {
    id,
    initial,
    states: () => names,
    has: (s) => Boolean(states[s]),
    means: (s) => requireState(s).means ?? null,
    isTerminal: (s) => Boolean(requireState(s).terminal),

    /** Transition names legal from this state. */
    transitions: (from) => Object.keys(requireState(from).on ?? {}),

    can(from, transition) {
      if (!states[from]) return false;
      return Boolean((states[from].on ?? {})[transition]);
    },

    /** The state that results, or throw. This is the enforcement point. */
    next(from, transition) {
      const node = requireState(from);
      const target = (node.on ?? {})[transition];
      if (!target) throw new IllegalTransition(id, from, transition, Object.keys(node.on ?? {}));
      if (!states[target]) {
        throw new Error(`[${id}] transition "${transition}" targets undefined state "${target}"`);
      }
      return target;
    },

    /**
     * Transitions that exist ANYWHERE in this graph but are not legal here.
     * This is the question Forge AI should ask: not "what happened" but
     * "what is impossible" — an inspection passing on a component still in
     * manufacturing is not a delay, it is corruption.
     */
    impossible(from) {
      const legal = new Set(api.transitions(from));
      return api.allTransitions().filter((t) => !legal.has(t));
    },

    allTransitions() {
      const all = new Set();
      for (const s of names) for (const t of Object.keys(states[s].on ?? {})) all.add(t);
      return [...all];
    },

    /** Graph integrity: every target exists, every state reachable, terminals are dead ends. */
    validate() {
      const problems = [];
      for (const s of names) {
        for (const [t, target] of Object.entries(states[s].on ?? {})) {
          if (!states[target]) problems.push(`${s} --${t}--> undefined state "${target}"`);
        }
        if (states[s].terminal && Object.keys(states[s].on ?? {}).length) {
          problems.push(`"${s}" is terminal but declares transitions`);
        }
      }
      const seen = new Set([initial]);
      const queue = [initial];
      while (queue.length) {
        const cur = queue.shift();
        for (const target of Object.values(states[cur].on ?? {})) {
          if (!seen.has(target) && states[target]) { seen.add(target); queue.push(target); }
        }
      }
      for (const s of names) if (!seen.has(s)) problems.push(`"${s}" is unreachable from "${initial}"`);
      return { valid: problems.length === 0, problems };
    },
  };
  return Object.freeze(api);
}

/** A registry of graphs, one per manufacturing object class. */
export function createStateRegistry(machines = {}) {
  const map = new Map(Object.entries(machines));
  return Object.freeze({
    for: (objectClass) => map.get(objectClass) ?? null,
    classes: () => [...map.keys()],
    /** Validate every graph at boot. A malformed graph should fail loudly, once. */
    validateAll() {
      const out = {};
      for (const [k, m] of map) out[k] = m.validate();
      return { valid: Object.values(out).every((r) => r.valid), byClass: out };
    },
  });
}

export default { createStateMachine, createStateRegistry, IllegalTransition, UnknownState };
