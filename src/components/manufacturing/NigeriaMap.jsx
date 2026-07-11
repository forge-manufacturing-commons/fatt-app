import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForgeActivity } from "../../lib/ForgeActivityEngine.jsx";
import "./NigeriaMap.css";
import plateUrl from "../../assets/nigeria/transparent_overlay_top.png";
import { HUBS, SEQUENCE } from "./nigeriaData";
import NetworkNode from "./NetworkNode";
import NetworkLines from "./NetworkLines";
import HubPanel from "./HubPanel";
import StatsPanel from "./StatsPanel";

// ============================================================
// FORGE MANUFACTURING COMMAND CENTER (Sprint 2 — 2.5D)
// The forged Nigeria plate is the centerpiece. Plate, nodes and
// network share ONE coordinate plane: percentages of the full
// 2000x2000 overlay image. Coordinates live in nigeriaData.js.
// ============================================================
export default function NigeriaMap() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(null);
  const { event, phase } = useForgeActivity();

  // If an activity event has a known hub location code, activate that hub in the panel.
  useEffect(() => {
    if (phase === "quiet") return;
    if (!event?.locationCode) return;
    const hit = HUBS.find(h => h.shortName === event.locationCode);
    if (hit) setActive(hit);
  }, [event, phase]);

  // After the activation sequence, feature Effurun/Warri by default.
  useEffect(() => {
    const t = setTimeout(
      () => setActive(a => a || HUBS.find(h => h.featured)),
      reduce ? 300 : (SEQUENCE.particles + 0.6) * 1000
    );
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <section className="cc-section" aria-label="Forge Manufacturing Command Center">
      <div className="wrap">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 25 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="forge-section-id">
            <span className="num">04</span>
            <span className="slash">/</span>
            <span className="name">Command</span>
          </div>
          <h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}>
            <span className="line stagger-1"><span>Ten cities.</span></span>
            <span className="line stagger-2"><span className="cyan">One shared build.</span></span>
          </h2>
          <p className="forge-human lead" style={{ marginTop: 24 }}>
            Every city on this plate already has people who can build. Fabricators in Aba.
            Engineers in Effurun and Warri. Energy specialists in Port Harcourt. Universities
            in Ilorin. Automotive workshops in Nnewi. Forge coordinates them around the
            same vehicle.
          </p>
        </motion.div>

        <div className="cc-stage">
          <div className="cc-plane">
            {/* Billet thickness — dark drop layer underneath */}
            <img src={plateUrl} className="cc-plate-billet" alt="" aria-hidden="true" draggable="false" />
            <motion.img
              src={plateUrl}
              alt="Forged Nigeria manufacturing plate — a precision-machined national network map"
              className="cc-plate"
              draggable="false"
              initial={reduce ? false : { opacity: 0, scale: 1.05 }}
              whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: SEQUENCE.plate, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Machined gold perimeter — thin chamfer via outline SVG */}
            <div className="cc-plate-perimeter" aria-hidden="true" style={{
              left: (234/2000*100)+"%", top: (382/2000*100)+"%",
              width: (1610/2000*100)+"%", height: (1328/2000*100)+"%",
            }}>
              <svg viewBox="0 0 1567.84 1299.39" preserveAspectRatio="xMidYMid meet">
                <path d="M 772.88,1204.86 L 728.76,1227.26 L 681.25,1241.76 L 632.82,1252.82 L 585.16,1246.87 L 543.83,1273.48 L 494.53,1279.39 L 445.41,1274.07 L 406.50,1244.17 L 378.09,1203.45 L 355.40,1159.41 L 337.80,1112.98 L 308.99,1072.64 L 274.65,1036.77 L 233.85,1008.82 L 184.90,1005.82 L 135.59,1011.57 L 87.10,1022.13 L 38.35,1023.42 L 20.00,979.95 L 21.33,930.30 L 26.10,880.84 L 31.46,831.43 L 33.29,781.82 L 29.30,732.31 L 37.30,683.38 L 54.33,636.79 L 89.18,601.99 L 121.64,564.37 L 151.69,524.84 L 142.85,481.78 L 166.74,438.70 L 155.95,391.36 L 138.33,345.16 L 145.07,296.19 L 146.99,246.53 L 152.02,197.14 L 178.22,156.14 L 197.49,111.38 L 208.83,63.18 L 245.92,35.32 L 294.61,25.44 L 343.98,20.00 L 393.43,23.22 L 440.93,37.66 L 486.33,57.82 L 527.67,84.75 L 560.93,120.32 L 610.04,123.33 L 650.70,97.77 L 697.47,92.64 L 743.15,112.11 L 787.72,134.09 L 833.08,154.33 L 881.70,161.55 L 925.60,139.23 L 963.39,106.99 L 1010.29,95.70 L 1059.42,100.87 L 1104.13,82.65 L 1153.34,88.64 L 1198.59,108.56 L 1243.91,128.38 L 1290.23,115.31 L 1328.43,83.58 L 1367.43,53.05 L 1400.72,73.20 L 1426.33,115.78 L 1451.11,158.86 L 1477.31,201.06 L 1512.85,208.31 L 1547.84,243.51 L 1540.39,284.63 L 1525.28,328.38 L 1488.11,361.34 L 1450.53,393.86 L 1417.62,430.88 L 1398.70,476.60 L 1385.13,524.39 L 1372.29,572.28 L 1342.32,609.90 L 1332.15,658.53 L 1310.13,702.14 L 1268.69,729.42 L 1240.48,768.51 L 1228.41,816.53 L 1203.64,859.57 L 1196.58,908.23 L 1159.32,940.30 L 1113.98,960.05 L 1069.72,943.16 L 1033.28,909.51 L 986.36,906.54 L 949.49,939.49 L 915.83,976.04 L 873.36,981.09 L 846.68,1022.57 L 825.65,1067.59 L 805.79,1113.14 L 794.34,1161.35 Z" />
              </svg>
            </div>
            <NetworkLines />
            {HUBS.map((hub, i) => (
              <NetworkNode key={hub.id} hub={hub} index={i} active={active} onSelect={setActive} />
            ))}
          </div>
          <HubPanel hub={active} />
        </div>

        <StatsPanel />
      </div>
    </section>
  );
}
