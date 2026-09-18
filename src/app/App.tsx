import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { hydrateApp } from "../platform/auth";
import { EditEntry } from "../screens/EditEntry";
import { EntryDetail } from "../screens/EntryDetail";
import { Home } from "../screens/Home";
import { Insights } from "../screens/Insights";
import { Settings } from "../screens/Settings";
import { Signup } from "../screens/Signup";
import { PhoneShell } from "../shell/PhoneShell";

export function App() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/signup" && !pathname.endsWith("/edit");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void hydrateApp()
      .catch(() => undefined)
      .then(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return null;

  return (
    <PhoneShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/entries/:id" element={<EntryDetail />} />
        <Route path="/entries/:id/edit" element={<EditEntry />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav ? <BottomNav /> : null}
    </PhoneShell>
  );
}
