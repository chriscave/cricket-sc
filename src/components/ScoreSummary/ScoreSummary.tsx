import "./ScoreSummary.css";
import type { ReactNode } from "react";
import type { ScoreSummaryData } from "./selectors";

// Left block: one row each, with a ruled area beside it for tally marks and a box at
// the end for the row's total.
const EXTRAS: { key: keyof ScoreSummaryData["extras"]; label: string }[] = [
  { key: "byes",        label: "Byes" },
  { key: "legByes",     label: "Leg byes" },
  { key: "wides",       label: "Wides" },
  { key: "noBalls",     label: "No balls" },
  { key: "penalty",     label: "Penalty" },
];

// Right block: three label/value pairs, taking up the same height as the five extras rows.
const TOTALS: { key: keyof ScoreSummaryData["totals"]; label: string; bold?: boolean }[] = [
  { key: "sTotal", label: "S. total" },
  { key: "extras", label: "Extras" },
  { key: "gTotal", label: "G. total", bold: true },
];

// Bottom line of the book: "For __ wickets in __ overs in __ minutes __"
const FOOTER = [
  { key: "for",       label: "For" },
  { key: "wicketsIn", label: "Wickets in" },
  { key: "oversIn",   label: "Overs in" },
  { key: "minutes",   label: "Minutes" },
];

/*
  tally, extras, totals: from selectScoreSummary.
  footer: { wicketsIn, oversIn, minutes }   // "For" is a label only
*/
type ScoreSummaryProps = ScoreSummaryData & {
  footer?: Partial<Record<string, ReactNode>>;
};

export default function ScoreSummary({ tally, extras, totals, footer = {} }: ScoreSummaryProps) {
  return (
    <div className="score-summary">
      <div className="ss-grid">
        {EXTRAS.map((e, i) => (
          <div key={e.key} className="ss-line" style={{ gridRow: `${i * 3 + 1} / span 3` }}>
            <div className="ss-cell ss-label">{e.label}</div>
            <div className="ss-cell ss-tally">
              {tally[e.key].map((runs, j) => <span key={j}>{runs}</span>)}
            </div>
            <div className="ss-cell ss-score">{extras[e.key]}</div>
          </div>
        ))}

        {TOTALS.map((t, i) => (
          <div
            key={t.key}
            className={`ss-total ${t.bold ? "ss-bold" : ""}`}
            style={{ gridRow: `${i * 5 + 1} / span 5` }}
          >
            <div className="ss-cell ss-total-label">{t.label}</div>
            <div className="ss-cell ss-total-value">{totals[t.key]}</div>
          </div>
        ))}
      </div>

      <div className="ss-footer">
        {FOOTER.map((f) => (
          <div key={f.key} className="ss-pair">
            <span className="ss-pair-label">{f.label}</span>
            <span className="ss-pair-value">{footer[f.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}