import "./ForgeButton.css";

export default function ForgeButton({
  children,
  onClick,
  href,
  variant = "primary",
  icon,
  className = "",
}) {

  const content = (
    <>
      <span className="forge-btn-pattern"></span>

      <span className="forge-btn-text">
        {children}
      </span>

      {icon && (
        <span className="forge-btn-icon">
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`forge-btn ${variant} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`forge-btn ${variant} ${className}`}
      onClick={onClick}
    >
      {content}
    </button>
  );
}