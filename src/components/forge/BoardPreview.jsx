import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../../lib/supabase";
import { useForgeActivity } from "../../lib/ForgeActivityEngine.jsx";
import { HumanGlyph } from "../../humans/HumanGlyphLibrary.jsx";
import { STUDIO } from "../../lib/ForgeStudio";

// ============================================================
// 06 / BUILD BOARD — the manufacturing heartbeat of Forge.
// Not a card grid. Not a website section. A work-order terminal:
// component code · owner · location · revision · progress · evidence
// · sign-off · dependencies · who's waiting. Every field is either
// real (jobs data) or seed-marked evidence layer (§8, §12 humanity).
// The section responds to the activity engine — the row matching
// the current tone quietly registers a status change.
// ============================================================

// Evidence layer — human capability behind each component.
// Human names + institutions used illustratively; each row is clearly
// marked "SEED EVIDENCE" so the visitor never mistakes it for verified
// live activity. This is the "people through work" requirement.
const EVIDENCE = {
  1: { code:"CHS-001", location:"Effurun / Warri", rev:"REV.04",
       owner:"Automotive workshop",   ownerRole:"SME",
       signoff:"Engr. Adebayo",       signoffRole:"Reviewer",
       waitingOn:["FRM drawing revision"], nextTo:"Assembly bay",
       progress:78,
       humanRole:"WELDER", humanVariant:"F" },
  2: { code:"BDY-002", location:"Aba",             rev:"REV.02",
       owner:"Sheet-metal SME",       ownerRole:"Fabricator",
       signoff:"Awaiting review",     signoffRole:"Reviewer",
       waitingOn:["Panel dimensions confirmed"], nextTo:"Chassis mount",
       progress:52, humanRole:"WELDER", humanVariant:"M" },
  3: { code:"KTB-003", location:"Nnewi",           rev:"REV.05",
       owner:"Sheet-metal SME",       ownerRole:"Fabricator",
       signoff:"Engr. Okonkwo",       signoffRole:"University reviewer",
       waitingOn:[], nextTo:"Service module fit-up",
       progress:100, humanRole:"ENGINEER", humanVariant:"F" },
  4: { code:"GAS-004", location:"Port Harcourt",   rev:"REV.03",
       owner:"Certified gas fitter",  ownerRole:"SME",
       signoff:"Named engineer required", signoffRole:"Safety",
       waitingOn:["SON certification check"], nextTo:"Installation",
       progress:88, humanRole:"INSPECTOR", humanVariant:"M" },
  5: { code:"ELC-005", location:"Lagos",           rev:"REV.02",
       owner:"Solar / inverter SME",  ownerRole:"SME",
       signoff:"Diaspora technical review", signoffRole:"Reviewer",
       waitingOn:["Load calculation"], nextTo:"Systems integration",
       progress:64, humanRole:"ENGINEER", humanVariant:"M" },
  6: { code:"CKL-006", location:"Nnewi",           rev:"REV.03",
       owner:"Stainless kitchen SME", ownerRole:"Fabricator",
       signoff:"Verified — accepted", signoffRole:"Reviewer",
       waitingOn:[], nextTo:"Service module install",
       progress:100, humanRole:"INSPECTOR", humanVariant:"F" },
  7: { code:"EXT-007", location:"Awaiting workshop", rev:"REV.01",
       owner:"Ventilation SME",       ownerRole:"SME",
       signoff:"Not yet assigned",    signoffRole:"—",
       waitingOn:["Owner assignment"], nextTo:"Fabrication start",
       progress:8 },
  8: { code:"LVY-008", location:"Lagos",           rev:"REV.02",
       owner:"Print / graphics SME",  ownerRole:"Fabricator",
       signoff:"Verified — accepted", signoffRole:"Reviewer",
       waitingOn:[], nextTo:"Body panel application",
       progress:100 },
};

const STAGE_LABEL = { done:"COMPLETE", qa:"IN REVIEW", fabricating:"IN PROGRESS", queued:"QUEUED" };
const STAGE_TONE  = { done:"emerald",  qa:"gold",      fabricating:"cyan",       queued:"muted"   };

// ForgeStudio Status & Ownership — NAWEDOAM lifecycle badges
// (Status/sta-*.svg — cross-portal, do not build a page-specific badge)
const STUDIO_BADGE = {
  done:         STUDIO.staVerified,
  qa:           STUDIO.staVerification,
  fabricating:  STUDIO.staInFabrication,
  queued:       STUDIO.staAssigned,
};

// map activity tone → which board rows quietly register a change
const TONE_STAGE = { fabricate:"fabricating", review:"qa", evidence:"qa", accept:"done" };

export default function BoardPreview() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { event, phase, tone } = useForgeActivity();
  const [jobs, setJobs] = useState([]);
  const [pulseId, setPulseId] = useState(null);
  useEffect(() => { fetchJobs().then(setJobs); }, []);

  // When an event lands, briefly pulse a matching row (cause & effect §7).
  useEffect(() => {
    if (phase === "quiet") { setPulseId(null); return; }
    const targetStage = TONE_STAGE[tone];
    if (!targetStage) return;
    const hit = jobs.find(j => j.stage === targetStage);
    if (!hit) return;
    setPulseId(hit.id);
    const t = setTimeout(() => setPulseId(null), 1200);
    return () => clearTimeout(t);
  }, [phase, tone, jobs]);

  // Summary strip (SCADA-style vitals)
  const total = jobs.length;
  const complete = jobs.filter(j => j.stage === "done").length;
  const inReview = jobs.filter(j => j.stage === "qa").length;
  const inProgress = jobs.filter(j => j.stage === "fabricating").length;
  const queued = jobs.filter(j => j.stage === "queued").length;

  return (
    <section className="forge-section board-os board-terminal" aria-label="Live build board terminal">
      <div className="wrap">
        <div className="forge-section-id">
          <span className="num">06</span>
          <span className="slash">/</span>
          <span className="name">Build board</span>
        </div>

        <motion.h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <span className="line stagger-1"><span>You've seen the network.</span></span>
          <span className="line stagger-2"><span className="cyan">Now see the work.</span></span>
        </motion.h2>

        <p className="forge-human lead" style={{ marginTop: 24 }}>
          Every row below is a component of NAWEDOAM — an SME, a workshop or an institution
          responsible for it, a reviewer whose sign-off it needs, and the next step it moves to.
          When a part is safety-critical, a named engineer signs off before it joins the vehicle.
        </p>

        {/* --- SCADA VITALS STRIP -------------------------------- */}
        <div className="board-vitals" role="status" aria-live="polite">
          <div className="board-vitals-cell">
            <div className="forge-technical">Components</div>
            <div className="board-vitals-value">{total}</div>
          </div>
          <div className="board-vitals-cell">
            <div className="forge-technical">In progress</div>
            <div className="board-vitals-value cyan">{inProgress}</div>
          </div>
          <div className="board-vitals-cell">
            <div className="forge-technical">In review</div>
            <div className="board-vitals-value gold">{inReview}</div>
          </div>
          <div className="board-vitals-cell">
            <div className="forge-technical">Complete</div>
            <div className="board-vitals-value emerald">{complete}</div>
          </div>
          <div className="board-vitals-cell">
            <div className="forge-technical">Queued</div>
            <div className="board-vitals-value muted">{queued}</div>
          </div>
          <div className="board-vitals-tick" aria-hidden="true">
            <span className="forge-system emerald no-brackets">SYSTEM · LIVE</span>
          </div>
        </div>

        {/* --- WORK-ORDER TERMINAL ------------------------------- */}
        <div className="board-terminal-frame">
          <div className="board-terminal-header">
            <span className="geo-reg tl" /><span className="geo-reg tr" />
            <div className="board-terminal-cols">
              <div className="forge-technical">Component</div>
              <div className="forge-technical">Owner &amp; location</div>
              <div className="forge-technical">Progress</div>
              <div className="forge-technical">Status</div>
              <div className="forge-technical">Sign-off</div>
              <div className="forge-technical">Next</div>
            </div>
          </div>

          <div className="board-terminal-rows" role="list">
            {jobs.slice(0, 6).map((j, i) => {
              const ev = EVIDENCE[j.id] || {};
              const isPulse = pulseId === j.id;
              const tone_class = STAGE_TONE[j.stage] || "muted";
              return (
                <motion.div key={j.id} role="listitem"
                  className={"board-row" + (isPulse ? " board-row-pulse" : "")}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  {/* col 1 — component */}
                  <div className="board-col board-col-comp">
                    <div className="board-col-code forge-technical">{ev.code} <span className="rev">· {ev.rev}</span></div>
                    <div className="board-col-name">{j.name}</div>
                    {j.safety_critical && <span className="board-safety-tag">Safety-critical</span>}
                  </div>

                  {/* col 2 — owner + location */}
                  <div className="board-col">
                    <div className="board-col-owner">{ev.owner || j.owner_org}</div>
                    <div className="forge-technical">{ev.location}</div>
                  </div>

                  {/* col 3 — progress bar */}
                  <div className="board-col board-col-progress">
                    <div className="board-progress" aria-label={"Progress " + (ev.progress ?? 0) + "%"}>
                      <div className={"board-progress-fill tone-" + tone_class}
                        style={{ width: (ev.progress ?? 0) + "%" }} />
                      <div className="board-progress-ticks">
                        <span /><span /><span /><span />
                      </div>
                    </div>
                    <div className="forge-technical" style={{ marginTop: 6 }}>{ev.progress ?? 0}%</div>
                  </div>

                  {/* col 4 — status signal */}
                  <div className="board-col board-col-status">
                    <img className="board-status-badge" src={STUDIO_BADGE[j.stage] || STUDIO.staAssigned} alt="" aria-hidden="true" />
                    <span className={"forge-signal " + tone_class}>{STAGE_LABEL[j.stage]}</span>
                  </div>

                  {/* col 5 — human sign-off */}
                  <div className="board-col board-col-human">
                    {ev.humanRole && (
                      <HumanGlyph
                        role={ev.humanRole}
                        variant={ev.humanVariant}
                        size={32}
                        animate={isPulse}
                        className="board-col-human-glyph"
                      />
                    )}
                    <div className="board-col-human-body">
                      <div className="board-col-signoff">{ev.signoff}</div>
                      <div className="forge-technical" style={{ opacity: .6 }}>{ev.signoffRole}</div>
                    {ev.waitingOn && ev.waitingOn.length > 0 && (
                      <div className="board-col-waiting forge-human" style={{ fontSize: 11, marginTop: 6, opacity: .55 }}>
                        Waiting on: {ev.waitingOn.join(", ")}
                      </div>
                    )}
                    </div>
                  </div>

                  {/* col 6 — next destination */}
                  <div className="board-col">
                    <div className="forge-technical" style={{ opacity: .55 }}>MOVES TO</div>
                    <div className="board-col-next">→ {ev.nextTo}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="board-terminal-footer">
            <span className="geo-reg bl" /><span className="geo-reg br" />
            <span className="forge-system no-brackets" style={{ opacity: .55 }}>
              SEED EVIDENCE · ILLUSTRATIVE NAMES · ROWS UPDATE FROM VERIFIED REGISTRATIONS AS NETWORK ACTIVATES
            </span>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button className="forge-button" onClick={() => navigate("/board")}>Open the full board</button>
          <button className="forge-button secondary" onClick={() => navigate("/join")}>Take on a component</button>
        </div>
      </div>
    </section>
  );
}
