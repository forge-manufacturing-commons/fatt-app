export default function HeroButtons({ navigate }) {
  return (
    <div className="hero-buttons">
      <button className="forge-button" onClick={() => navigate("/join")}>
        Join the build →
      </button>
      <button className="forge-button secondary" onClick={() => {
        const el = document.querySelector(".pipe-os");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}>
        See how Forge works
      </button>
    </div>
  );
}
