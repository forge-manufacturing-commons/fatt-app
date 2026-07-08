export default function HeroButtons({ navigate }) {
  return (
    <div className="hero-buttons">

      <button
        className="btn btn-pink"
        onClick={() => navigate("/join")}
      >
        Join the Build →
      </button>

      <button
        className="btn btn-line"
        onClick={() => navigate("/board")}
      >
        Explore Platform
      </button>

    </div>
  );
}