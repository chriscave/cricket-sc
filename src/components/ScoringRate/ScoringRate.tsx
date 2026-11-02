import "./ScoringRate.css";
import type { ReactNode } from "react";
import type { OverRate } from "./selectors";

// One entry per column after the over number, and what it shows for an over. `prev` is
// the over before. Wickets is left blank when it hasn't changed since then, as a scorer
// would. Order MUST match grid-template-columns in the CSS.
const COLUMNS: { label: string; cell: (o: OverRate, prev?: OverRate) => ReactNode }[] = [
  { label: "Total score",        cell: (o) => o.score },
  { label: "Wickets",            cell: (o, prev) => (o.wickets !== (prev?.wickets ?? 0) ? o.wickets : null) },
  { label: "Bowler no. in over", cell: (o) => o.bowlerId },
  { label: "Runs in over",       cell: (o) => o.runs },
  { label: "Run rate",           cell: (o) => o.rate.toFixed(1) },
];

// rates: from selectScoringRate, index 0 = over 1.
// overs: how many rows to draw (default 60, one continuous table).
export default function ScoringRate({ rates = [], overs = 60 }: { rates?: OverRate[]; overs?: number }) {
  const rows = Array.from({ length: overs }, (_, i) => rates[i]);

  return (
    <div className="scoring-rate">
      <div className="sr-group">
        <div className="sr-label">Scoring rate</div>
        {["Over no.", ...COLUMNS.map((c) => c.label)].map((label) => (
          <div key={label} className="sr-cell sr-sub">
            <span>{label}</span>
          </div>
        ))}
      </div>

      {rows.map((row, i) => (
        <div key={i} className="sr-row">
          <div className="sr-cell">{i + 1}</div>
          {COLUMNS.map((c) => (
            <div key={c.label} className="sr-cell">{row && c.cell(row, rates[i - 1])}</div>
          ))}
        </div>
      ))}
    </div>
  );
}