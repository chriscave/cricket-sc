import "./ScoreSummary.css";

// Left block: one row each, with a ruled area beside it for tally marks.
const EXTRAS = [
  { key: "byes",        label: "Byes" },
  { key: "legByes",     label: "Leg byes" },
  { key: "wides",       label: "Wides" },
  { key: "noBalls",     label: "No balls" },
  { key: "penalty",     label: "Penalty" },
  { key: "totalExtras", label: "Total extras" },
];

// Right block: each label/value pair spans two rows of the left block.
const TOTALS = [
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
  extras: { byes, legByes, wides, noBalls, penalty, totalExtras }  // shown next to each label
  tally:  { byes: "||||", ... }                                    // optional ruled-area marks
  totals: { sTotal, extras, gTotal }
  footer: { wicketsIn, oversIn, minutes }   // "For" is a label only
*/
export default function ScoreSummary({ extras = {}, tally = {}, totals = {}, footer = {} }) {
  return (
    <div className="score-summary">
      <div className="ss-grid">
        {EXTRAS.map((e, i) => (
          <div key={e.key} className="ss-line" style={{ gridRow: i + 1 }}>
            <div className="ss-cell ss-label">{e.label}</div>
            <div className="ss-cell ss-tally">{tally[e.key] ?? extras[e.key]}</div>
          </div>
        ))}

        {TOTALS.map((t, i) => (
          <div
            key={t.key}
            className={`ss-total ${t.bold ? "ss-bold" : ""}`}
            style={{ gridRow: `${i * 2 + 1} / span 2` }}
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