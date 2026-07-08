import "./ForgePanel.css";

export default function ForgePanel({
  title,
  eyebrow,
  children,
  accent = "teal",
  className = "",
}) {
  return (
    <section className={`forge-panel ${accent} ${className}`}>

      <div className="forge-pattern"></div>

      <div className="forge-topbar">
        <div className="forge-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="forge-line"></div>
      </div>

      {eyebrow && (
        <div className="forge-eyebrow">
          {eyebrow}
        </div>
      )}

      {title && (
        <h2 className="forge-title">
          {title}
        </h2>
      )}

      <div className="forge-content">
        {children}
      </div>

    </section>
  );
}