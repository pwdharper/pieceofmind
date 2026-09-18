import { useLayoutEffect, useRef } from "react";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import { UI } from "../content/uiCopy";
import { useLocale } from "../hooks/useLocale";
import { readNavFrom } from "../lib/navFrom";
import { scrollShellToTop } from "../lib/scrollShell";
import "./chrome.css";

export function BottomNav() {
  const location = useLocation();
  const pendingTop = useRef(false);
  const t = UI[useLocale()].nav;
  const hide = location.pathname === "/signup" || location.pathname.endsWith("/edit");

  useLayoutEffect(() => {
    if (hide || !pendingTop.current) return;
    pendingTop.current = false;
    scrollShellToTop();
  }, [hide, location.pathname, location.key]);

  if (hide) return null;

  const onDetail = Boolean(matchPath({ path: "/entries/:id", end: true }, location.pathname));
  const from = readNavFrom(location.state);
  const tabs = [
    { to: "/", label: t.home, end: true, icon: HomeIcon, key: "home" },
    { to: "/insights", label: t.insights, end: false, icon: ChartIcon, key: "insights" },
    { to: "/settings", label: t.settings, end: false, icon: GearIcon, key: "settings" },
  ] as const;

  function handleTabClick() {
    pendingTop.current = true;
    scrollShellToTop();
  }

  return (
    <nav className="bottom-nav" aria-label={t.menu}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          onClick={handleTabClick}
          className={({ isActive }) => {
            const onThisOrigin = onDetail && tab.key === from;
            return isActive || onThisOrigin ? "nav-tab is-active" : "nav-tab";
          }}
        >
          <tab.icon />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 9.2L10 3l7 6.2V17H3V9.2z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 16V9M10 16V4M16 16v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3.2v1.6M10 15.2v1.6M3.2 10h1.6M15.2 10h1.6M5.2 5.2l1.1 1.1M13.7 13.7l1.1 1.1M14.8 5.2l-1.1 1.1M6.3 13.7l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
