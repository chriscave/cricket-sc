import "./RunMilestones.css";
import type { ReactNode } from "react";
import Clock from "@/components/Clock";
import type { RunMilestone } from "./selectors";

// Milestones 50, 100 ... 350. Pass `milestones` for a different set.
const DEFAULT_MILESTONES = Array.from({ length: 7 }, (_, i) => (i + 1) * 50);

// One entry per column after the runs, and what it shows for a milestone reached.
// Order MUST match grid-template-columns in the CSS.
const COLUMNS: { label: string; cell: (m: RunMilestone) => ReactNode }[] = [
  { label: "Time",  cell: (m) => <Clock at={m.time} /> },
  { label: "Min.",  cell: (m) => m.minutes },
  { label: "Balls", cell: (m) => m.balls },
];

// reached: from selectRunMilestones, keyed by the milestone.
export default function RunMilestones({
  milestones = DEFAULT_MILESTONES,
  reached = {},
}: {
  milestones?: number[];
  reached?: Record<number, RunMilestone>;
}) {
  return (
    <div className="run-milestones">
      <div className="rm-row rm-head">
        <div className="rm-cell">Runs</div>
        {COLUMNS.map((c) => (
          <div key={c.label} className="rm-cell">{c.label}</div>
        ))}
      </div>

      {milestones.map((m) => (
        <div key={m} className="rm-row rm-body">
          <div className="rm-cell rm-runs">{m}</div>
          {COLUMNS.map((c) => (
            <div key={c.label} className="rm-cell rm-value">{reached[m] && c.cell(reached[m])}</div>
          ))}
        </div>
      ))}
    </div>
  );
}