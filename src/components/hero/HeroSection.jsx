import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SITE } from "../../constants/site";
import HeroButtons from "./HeroButtons";
import HeroStats from "./HeroStats";
import KeiretsuHero from "../KeiretsuHero";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero-v2">
      <div className="hero-left">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >
          <div className="hero-eyebrow">
            AFRICA'S DISTRIBUTED MANUFACTURING MOVEMENT
          </div>

          <h1 className="hero-title">

            <span>{SITE.hero.title[0]}</span>

            <span className="cyan">
              {SITE.hero.title[1]}
            </span>

            <span className="pink">
              {SITE.hero.title[2]}
            </span>

          </h1>

          <p className="hero-description">
            {SITE.hero.subtitle}
          </p>

          <HeroButtons navigate={navigate} />

          <HeroStats />

        </motion.div>

      </div>

      <div className="hero-right">
        <KeiretsuHero />
      </div>

    </section>
  );
}