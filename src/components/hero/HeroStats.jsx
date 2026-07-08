import CountUp from "react-countup";
import { STATS } from "../../constants/site";

export default function HeroStats() {
  return (
    <div className="hero-stats">

      {STATS.map(stat => (

        <div
          key={stat.label}
          className="hero-stat"
        >

          <div className="value">

            <CountUp
              end={stat.value}
              duration={2}
            />

            +

          </div>

          <div className="label">

            {stat.label}

          </div>

        </div>

      ))}

    </div>
  );
}