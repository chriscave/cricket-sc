import "./MatchResult.css";

// Two lines. Each row has a label, then one or more ruled fields.
// A field with its own `label` shows it after the value: "[ value ] Home team".
const ROWS = [
  { label: "Result", fields: [{ key: "result" }] },
  {
    label: "Points",
    fields: [
      { key: "homePoints", label: "Home team" },
      { key: "awayPoints", label: "Away team" },
    ],
  },
];

/*
  values: { result, homePoints, awayPoints }
*/
export default function MatchResult({ values = {} }) {
  return (
    <div className="match-result">
      {ROWS.map((r) => (
        <div key={r.label} className="mr-row">
          <div className="mr-cell mr-label">{r.label}</div>
          {r.fields.map((f) => (
            <div key={f.key} className="mr-cell mr-field">
              <span className="mr-value">{values[f.key]}</span>
              {f.label && <span className="mr-small">{f.label}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}