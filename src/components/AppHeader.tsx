import "./chrome.css";

export function AppHeader({
  title = "Piece of Mind",
  onBack,
  size = "brand",
}: {
  title?: string;
  onBack?: () => void;
  size?: "brand" | "page";
}) {
  if (!onBack) {
    return (
      <header className="app-header">
        <h1 className={`app-brand${size === "page" ? " is-page" : ""}`}>{title}</h1>
      </header>
    );
  }

  return (
    <header className="app-header is-edit">
      <button type="button" className="header-back" onClick={onBack} aria-label="뒤로">
        <BackIcon />
      </button>
      <h1 className="app-brand">{title}</h1>
      <span className="header-spacer" aria-hidden />
    </header>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M13 4L7 10l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
