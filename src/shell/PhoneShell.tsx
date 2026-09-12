import type { ReactNode } from "react";
import "./PhoneShell.css";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="phone-frame">
      <div className="phone-canvas">{children}</div>
    </div>
  );
}
