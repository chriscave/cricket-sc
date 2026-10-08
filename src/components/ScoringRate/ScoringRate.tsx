import "./ScoringRate.css";

// One entry per column. Order MUST match grid-template-columns in the CSS.
const COLUMNS = [
  { key: "over",    label: "Over no." },
  { key: "score",   label: "Total score" },
  { key: "wickets", label: "Wickets" },
  { key: "bowler",  label: "Bowler no. in over" },
  { key: "runs",    label: "Runs in over" },
];

/*
  rates: [{ score, wickets, bowler, runs }, ...]  // index 0 = over 1
  overs: how many rows to draw (default 60, one continuous table)
*/
export default function ScoringRate({ rates = [], overs = 60 }) {
  const rows = Array.from({ length: overs }, (_, i) => rates[i] ?? {});

  return (
    <div className="scoring-rate">
      <div className="sr-group">
        <div className="sr-label">Scoring rate</div>
        {COLUMNS.map((c) => (
          <div key={c.key} className="sr-cell sr-sub">
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      {rows.map((row, i) => (
        <div key={i} className="sr-row">
          {COLUMNS.map((c) => (
            <div key={c.key} className="sr-cell">
              {c.key === "over" ? i + 1 : row[c.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}