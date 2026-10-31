import "./FallOfWickets.css";
import type { ReactNode } from "react";
import Clock from "@/components/Clock";
import type { FallOfWicket } from "./selectors";

const WICKETS = Array.from({ length: 10 }, (_, i) => i);

// One entry per row in the book, and what it shows for each wicket.
const ROWS: { label: string; cell: (w: FallOfWicket) => ReactNode }[] = [
  { label: "Score", cell: (w) => w.score },
  { label: "Outgoing bat & score", cell: (w) => `${w.outgoing.batterId} / ${w.outgoing.runs}` },
  {
    label: "Partnership",
    // One span, so the small balls sit on the same baseline as the runs.
    cell: (w) => <span>{w.partnership.runs}&nbsp;<span className="fw-balls">({w.partnership.balls})</span></span>,
  },
  {
    label: "Over no./time",
    cell: (w) => (
      <span className="fw-time-over">
        {w.over}
        <Clock at={w.time} className="fw-time" />
      </span>
    ),
  },
];

// wickets: from selectFallOfWickets, index 0 = 1st wicket.
export default function FallOfWickets({ wickets = [] }: { wickets?: FallOfWicket[] }) {
  return (
    <div className="fall-of-wickets">
      <div className="fw-row fw-head">
        <div className="fw-cell">Fall of wkt</div>
        {WICKETS.map((w) => (
          <div key={w} className="fw-cell">{w + 1}</div>
        ))}
      </div>

      {ROWS.map((r) => (
        <div key={r.label} className="fw-row fw-body">
          <div className="fw-cell fw-label">{r.label}</div>
          {WICKETS.map((w) => (
            <div key={w} className="fw-cell fw-value">{wickets[w] && r.cell(wickets[w])}</div>
          ))}
        </div>
      ))}
    </div>
  );
}