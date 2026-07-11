import { motion, useReducedMotion } from "framer-motion";
import { HUBS, LINKS, SEQUENCE } from "./nigeriaData";

export default function NetworkLines({ reduceMotion: reduceMotionProp, activeHubId }) {
  const hookReduce = useReducedMotion();
  const reduce = reduceMotionProp ?? hookReduce;
  const byId = Object.fromEntries(HUBS.map((hub) => [hub.id, hub]));
  const featuredId = HUBS.find((hub) => hub.featured)?.id;

  return (
    <svg className="cc-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {LINKS.map(([fromId, toId], index) => {
        const from = byId[fromId];
        const to = byId[toId];
        const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
        const routeActive = activeHubId && (fromId === activeHubId || toId === activeHubId);
        const routeFeatured = fromId === featuredId || toId === featuredId;
        const live = routeActive || routeFeatured;

        return (
          <g key={`${fromId}-${toId}`} className={live ? "is-live" : "is-resting"}>
            <motion.path
              d={path}
              className="cc-channel-recess"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: SEQUENCE.lines + index * 0.08, duration: 0.75, ease: "easeOut" }}
            />

            <motion.path
              id={`cc-link-${index}`}
              d={path}
              className={`cc-channel-gold${live ? " is-live" : ""}`}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: SEQUENCE.lines + index * 0.1, duration: 0.85, ease: "easeOut" }}
            />

            {!reduce && live && (
              <circle className="cc-particle" r="0.55">
                <animateMotion
                  dur={`${3 + (index % 3) * 0.8}s`}
                  begin={`${SEQUENCE.particles + index * 0.25}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#cc-link-${index}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        );
      })}

      {HUBS.filter((hub) => hub.labelAnchor).map((hub) => (
        <path
          key={`leader-${hub.id}`}
          className={`cc-leader${activeHubId === hub.id || hub.featured ? " is-live" : ""}`}
          d={`M ${hub.x} ${hub.y} L ${hub.x + (hub.labelDx || 0) * 0.14} ${hub.y + (hub.labelDy || 0) * 0.14}`}
        />
      ))}
    </svg>
  );
}
