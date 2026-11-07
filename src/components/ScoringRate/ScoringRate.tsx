import "./ScoringRate.css";
import { Fragment, type ReactNode } from "react";
import { bowlerColour } from "@/components/DeliveryMarks";
import type { OverRate } from "./selectors";

// One row per measure, under the over numbers, and what it shows for an over. `prev` is
// the over before. Wickets is left blank when it hasn't changed since then, as a scorer
// would.
const MEASURES: { label: string; cell: (o: OverRate, prev?: OverRate) => ReactNode }[] = [
  { label: "Total score",  cell: (o) => o.score },
  { label: "Wickets",      cell: (o, prev) => (o.wickets !== (prev?.wickets ?? 0) ? o.wickets : null) },
  { label: "Bowler no.",   cell: (o) => o.bowlerId },
  { label: "Runs in over", cell: (o) => o.runs },
  { label: "Run rate",     cell: (o) => o.rate.toFixed(1) },
];

// Overs per band. MUST match the repeat() in .sr-band's grid-template-columns.
const BAND = 30;

// The scoring rate read across: bands of 30 overs, each with the over numbers along the
// top and a row per measure. Alternate overs are striped so a column is easy to follow.
// rates: from selectScoringRate, index 0 = over 1. overs: how many to draw (default 60).
export default function ScoringRate({ rates = [], overs = 60 }: { rates?: OverRate[]; overs?: number }) {
  const bands = Array.from({ length: Math.ceil(overs / BAND) }, (_, b) =>
    Array.from({ length: BAND }, (_, i) => b * BAND + i),
  );
  const stripe = (i: number) => (i % 2 ? " sr-stripe" : "");

  return (
    <div className="scoring-rate">
      <div className="sr-title">Scoring rate</div>
      {bands.map((band, b) => (
        <div key={b} className="sr-band">
          <div className="sr-label sr-head">Over</div>
          {band.map((i) => (
            <div key={i} className={"sr-cell sr-head" + stripe(i)}>{i + 1}</div>
          ))}
          {MEASURES.map((m) => (
            <Fragment key={m.label}>
              <div className="sr-label">{m.label}</div>
              {band.map((i) => {
                const over = rates[i];
                return (
                  <div
                    key={i}
                    className={"sr-cell" + stripe(i)}
                    style={{ color: over && bowlerColour(over.bowlerId) }}
                  >
                    {over && m.cell(over, rates[i - 1])}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
