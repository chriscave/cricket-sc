import "./Dock.css";
import type { ReactNode } from "react";

// The bar at the bottom of the window. It shows one thing at a time: the command line,
// or a panel for a choice the scorer has to make (how out, next bowler).
export default function Dock({ children }: { children: ReactNode }) {
  return <div className="dock">{children}</div>;
}
