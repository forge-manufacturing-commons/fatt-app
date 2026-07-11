import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GALLERY } from "../lib/assets";

import HeroSection from "../components/hero/HeroSection";
import WhyForge from "../components/showcase/WhyForge";
import EcosystemSystem from "../components/forge/EcosystemSystem";
import AssemblyEvent from "../components/forge/AssemblyEvent";
import HowItWorks from "../components/showcase/HowItWorks";
import NigeriaMap from "../components/manufacturing/NigeriaMap";
import BoardPreview from "../components/forge/BoardPreview";
import ImpactStats from "../components/showcase/ImpactStats";
import GeoDivider from "../components/forge/GeoDivider";

// ============================================================
// FORGE OS — HOMEPAGE (consolidated industrial experience)
// Order: HERO → WHY FORGE → ECOSYSTEM → ASSEMBLY EVENT →
// PIPELINE → COMMAND CENTER → BUILD BOARD → GALLERY →
// SYSTEM STATUS → PARTICIPATION → FINAL DECLARATION.
// Legacy duplicate sections consolidated into the modular system.
// ============================================================
const CAPTIONS = ["NAWEDOAM — front quarter", "Side elevation", "Serving hatch open", "Rear galley", "Ankara livery", "Rear quarter"];

export default function Showcase() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  return (
    <>
      {/* 01 — HERO / SYSTEM DECLARATION */}
      <HeroSection />
      <GeoDivider />

      {/* 02 — WHY FORGE / THE COORDINATION PROBLEM */}
      <WhyForge />

      {/* 03 — DISTRIBUTED MANUFACTURING ECOSYSTEM */}
      <section className="forge-section eco-os" aria-label="Distributed manufacturing ecosystem">
        <div className="wrap">
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="section-kicker">The build ecosystem</div>
            <h2 className="section-title">Six kinds of people.<span className="cyan"> One shared vehicle.</span></h2>
            <p className="section-copy">
              Forge is not a factory. It is the network of people who together become a factory —
              each contributing what they already know how to do, connected around one vehicle.
            </p>
          </motion.div>
          <EcosystemSystem />
        </div>
      </section>
      <GeoDivider flip tone="cyan" />

      {/* 04 — THE FORGE ASSEMBLY EVENT (signature) */}
      <section className="forge-section asm-os" aria-label="The Forge assembly event">
        <div className="wrap">
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="section-kicker">Assembly event</div>
            <h2 className="section-title">Watch the vehicle<span className="gold"> come apart.</span></h2>
            <p className="section-copy">
              The vehicle breaks into systems anyone can point to and take responsibility for.
              Different hands build different parts. Then the parts come home to become one
              machine again.
            </p>
          </motion.div>
          <AssemblyEvent />
        </div>
      </section>

      {/* 05 — MANUFACTURING PIPELINE */}
      <HowItWorks />

      {/* 06 — NIGERIA MANUFACTURING COMMAND CENTER */}
      <NigeriaMap />

      {/* 07 — LIVE BUILD BOARD PREVIEW */}
      <BoardPreview />
      <GeoDivider />

      {/* 08 — NAWEDOAM VEHICLE DOSSIER */}
      {GALLERY.length > 0 && (
        <section className="forge-section dossier-os" aria-label="NAWEDOAM — shared build object">
          <div className="wrap">
            <div className="forge-section-id">
              <span className="num">04</span>
              <span className="slash">/</span>
              <span className="name">Build object</span>
            </div>
            <motion.h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="line stagger-1"><span>Forge Alpha</span> <span className="tick">/</span> <span className="gold">001</span></span>
              <span className="line stagger-2"><span>NAWEDOAM.</span></span>
            </motion.h2>
            <p className="forge-human lead" style={{ marginTop: 24 }}>
              The first shared vehicle the Forge network is coordinating to build.
              Different hands, in different places, contributing to one build object.
            </p>

            <div className="dossier-grid">
              <div className="dossier-primary forge-panel gold-rim">
                <span className="geo-reg tl" /><span className="geo-reg tr" />
                <span className="geo-reg bl" /><span className="geo-reg br" />
                <div className="dossier-primary-header">
                  <span className="forge-technical">VIEW <span className="slash">/</span> 01</span>
                  <span className="forge-system emerald no-brackets">DOMINANT</span>
                </div>
                <img src={GALLERY[0]} alt="NAWEDOAM — front quarter view" loading="lazy" />
                <div className="dossier-primary-footer">
                  <span className="forge-command" style={{ fontSize: "22px" }}>Front quarter</span>
                  <span className="forge-technical">Body system <span className="slash">·</span> Chassis geometry</span>
                </div>
              </div>

              <div className="dossier-secondary">
                {GALLERY.slice(1, 5).map((src, i) => {
                  const captions = ["Side elevation", "Hatch open", "Rear galley", "Livery"];
                  const codes    = ["02", "03", "04", "05"];
                  const zones    = ["Body system", "Service module", "Rear service", "Body finish"];
                  return (
                    <div className="dossier-card forge-panel" key={src}>
                      <div className="dossier-card-head">
                        <span className="forge-technical">VIEW <span className="slash">/</span> {codes[i]}</span>
                      </div>
                      <img src={src} alt={"NAWEDOAM — " + captions[i]} loading="lazy" />
                      <div className="dossier-card-foot">
                        <span className="forge-command" style={{ fontSize: "15px" }}>{captions[i]}</span>
                        <span className="forge-technical" style={{ opacity: .68 }}>{zones[i]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="attribution forge-system no-brackets" style={{ marginTop: 32 }}>
              Base 3D model: "Kei Truck" by grs (Sketchfab), CC-BY 4.0, modified.
            </p>
          </div>
        </section>
      )}

      {/* 09 — AUTHORITATIVE IMPACT / SYSTEM STATUS */}
      <ImpactStats />

      {/* 10 — PARTICIPATION CTA */}
      <section className="forge-section cta-os" aria-label="Enter the manufacturing network">
        <div className="cta-os-pattern" aria-hidden="true" />
        <div className="wrap">
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="section-kicker">Join the build</div>
            <h2 className="section-title">Come and<span className="gold"> help build it.</span></h2>
            <p className="section-copy">
              Whether you are an SME who fabricates parts, a lecturer whose workshop can help,
              a student wanting to learn on a real vehicle, an engineer at home or in the diaspora
              who can review drawings — there is honest work here that fits what you already do.
              Four ways to join: mentorship, in-kind support, program capital, and SME partnership.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <button className="forge-button" onClick={() => navigate("/join")}>Join the build →</button>
              <button className="forge-button secondary" onClick={() => navigate("/board")}>See the live build board</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 11 — FINAL FORGE DECLARATION */}
      <section className="final-os" aria-label="Forge declaration">
        <div className="wrap">
          <p className="final-os-lines">
            <span>Nobody builds it alone.</span>
            <span>Nigeria already has the people who can build.</span>
            <span className="gold">We build the vehicle together.</span>
          </p>
          <p className="final-os-sig">Forge · a Nigerian coordination system for people who make things.</p>
        </div>
      </section>
    </>
  );
}
