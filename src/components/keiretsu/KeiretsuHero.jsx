import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HERO_IMAGE } from "../../lib/assets";

const ACTORS = [
  { id: "smes", label: "SMEs", x: 18, y: 26, dx: 8, dy: 4 },
  { id: "poly", label: "UNIVERSITIES & POLYTECHNICS", x: 78, y: 22, dx: -20, dy: 4, anchor: "end" },
  { id: "youth", label: "YOUTHS", x: 12, y: 74, dx: 10, dy: -2 },
  { id: "diaspora", label: "DIASPORA", x: 84, y: 74, dx: -14, dy: -2, anchor: "end" },
  { id: "industry", label: "INDUSTRY", x: 34, y: 88, dx: 4, dy: -12, anchor: "middle" },
  { id: "government", label: "GOVERNMENT", x: 66, y: 88, dx: -4, dy: -12, anchor: "middle" },
];

const ROUTES = [
  ["smes", "core"],
  ["poly", "core"],
  ["youth", "core"],
  ["diaspora", "core"],
  ["industry", "core"],
  ["government", "core"],
];

const ROUTE_POINTS = {
  smes: "M 18 26 L 28 31 L 42 40 L 51 48",
  poly: "M 78 22 L 70 26 L 60 36 L 52 46",
  youth: "M 12 74 L 24 68 L 37 60 L 47 53",
  diaspora: "M 84 74 L 73 68 L 63 60 L 53 53",
  industry: "M 34 88 L 41 79 L 46 68 L 50 55",
  government: "M 66 88 L 59 79 L 54 68 L 50 55",
};

export default function KeiretsuHero() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(reduce ? "online" : "boot");
  const [activeCount, setActiveCount] = useState(reduce ? ACTORS.length : 0);

  useEffect(() => {
    if (reduce) return undefined;

    const timers = [];
    timers.push(window.setTimeout(() => setPhase("geometry"), 160));
    timers.push(window.setTimeout(() => setActiveCount(1), 420));
    timers.push(window.setTimeout(() => setActiveCount(2), 780));
    timers.push(window.setTimeout(() => setActiveCount(3), 1140));
    timers.push(window.setTimeout(() => setActiveCount(4), 1500));
    timers.push(window.setTimeout(() => setActiveCount(5), 1860));
    timers.push(window.setTimeout(() => setActiveCount(6), 2220));
    timers.push(window.setTimeout(() => setPhase("ignition"), 2460));
    timers.push(window.setTimeout(() => setPhase("online"), 3120));

    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  const online = phase === "online";
  const ignition = phase === "ignition";

  return (
    <motion.div
      className={`hero-system ${phase}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="hero-system-status">
        <span className="hero-system-kicker">NETWORK STATUS</span>
        <strong>
          {online
            ? "FORGE SYSTEM ONLINE"
            : ignition
              ? "FORGE IGNITION"
              : "NETWORK COORDINATED"}
        </strong>
      </div>

      <div className="hero-system-stage">
        <div className={`hero-structural ${phase}`} aria-hidden="true">
          <span className="hero-structural-line hero-line-a" />
          <span className="hero-structural-line hero-line-b" />
          <span className="hero-structural-line hero-line-c" />
          <span className="hero-structural-node hero-node-a" />
          <span className="hero-structural-node hero-node-b" />
          <span className="hero-structural-node hero-node-c" />
        </div>

        <svg
          className="hero-routes"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroRouteGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,0,0,.5)" />
              <stop offset="50%" stopColor="rgba(212,175,55,.95)" />
              <stop offset="100%" stopColor="rgba(65,226,255,.92)" />
            </linearGradient>
            <filter id="heroRouteGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="rgba(212,175,55,.35)" />
            </filter>
          </defs>

          <g className="hero-route-layer">
            {ROUTES.map(([from]) => (
              <path
                key={from}
                d={ROUTE_POINTS[from]}
                className={`hero-route-track ${activeCount > ROUTES.findIndex((route) => route[0] === from) ? "is-live" : ""}`}
              />
            ))}
          </g>

          <g className="hero-actor-lines">
            {ACTORS.map((actor, index) => {
              const live = activeCount > index;
              return (
                <path
                  key={actor.id}
                  d={`M ${actor.x} ${actor.y} L 50 52`}
                  className={`hero-route-signal ${live ? "is-live" : ""}`}
                  style={{ animationDelay: `${index * 0.14}s` }}
                />
              );
            })}
          </g>
        </svg>

        <div className="hero-actor-field" aria-hidden="true">
          {ACTORS.map((actor, index) => {
            const live = activeCount > index;
            return (
              <div
                key={actor.id}
                className={`hero-actor ${live ? "is-online" : ""}`}
                style={{ left: `${actor.x}%`, top: `${actor.y}%` }}
              >
                <span className="hero-actor-core" />
                <span className={`hero-actor-label anchor-${actor.anchor || "start"}`} style={{ "--dx": `${actor.dx || 0}px`, "--dy": `${actor.dy || 0}px` }}>
                  {actor.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className={`hero-core ${online ? "is-online" : ignition ? "is-ignition" : ""}`}>
          <div className="hero-core-shell">
            <div className="hero-core-frame" />
            <div className="hero-core-image">
              {HERO_IMAGE ? (
                <img src={HERO_IMAGE} alt="" aria-hidden="true" draggable="false" />
              ) : null}
            </div>
            <div className="hero-core-overlay" />
            <div className="hero-core-scan forge-scan" />
            <div className="hero-core-pulse forge-ignition" />
          </div>
          <div className="hero-core-tag">BUILD / VEHICLES / TOGETHER</div>
        </div>

        <div className="hero-system-footer">
          <span className="hero-system-chip">SMEs</span>
          <span className="hero-system-chip">Universities</span>
          <span className="hero-system-chip">Diaspora</span>
          <span className="hero-system-chip">Industry</span>
        </div>
      </div>
    </motion.div>
  );
}
