import "./MatchOfficials.css";

// One entry per block in the book. A block with several fields stacks them,
// each with its own small label and ruled line (Capts. has Home and Visit).
const ROWS = [
  { label: "Umpires",      fields: [{ key: "umpires" }] },
  { label: "Scorers",      fields: [{ key: "scorers" }] },
  { label: "Capts.",       fields: [{ key: "homeCaptain", label: "Home" }, { key: "visitCaptain", label: "Visit" }] },
  { label: "Man of match", fields: [{ key: "manOfMatch" }], compact: true },
];

/*
  values: { umpires, scorers, homeCaptain, visitCaptain, manOfMatch }
*/
export default function MatchOfficials({ values = {} }) {
  return (
    <div className="match-officials">
      {ROWS.map((r) => (
        <div key={r.label} className={r.compact ? "mo-row mo-compact" : "mo-row"}>
          <div className="mo-cell mo-label">{r.label}</div>
          <div className="mo-cell mo-fields">
            {r.fields.map((f) => (
              <div key={f.key} className="mo-field">
                {f.label && <span className="mo-field-label">{f.label}</span>}
                <span className="mo-line">{values[f.key]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}