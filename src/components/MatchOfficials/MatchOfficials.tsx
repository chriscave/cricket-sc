import "./MatchOfficials.css";
import EditableText from "@/components/EditableText";

export type MatchOfficialsValues = {
  umpires?: string;
  scorers?: string;
  homeCaptain?: string;
  visitCaptain?: string;
  manOfMatch?: string;
};
type Key = keyof MatchOfficialsValues;
type Row = { label: string; fields: { key: Key; label?: string }[]; compact?: boolean };

// One entry per block in the book. A block with several fields stacks them,
// each with its own small label and ruled line (Capts. has Home and Visit).
const ROWS: Row[] = [
  { label: "Umpires",      fields: [{ key: "umpires" }] },
  { label: "Scorers",      fields: [{ key: "scorers" }] },
  { label: "Capts.",       fields: [{ key: "homeCaptain", label: "Home" }, { key: "visitCaptain", label: "Visit" }] },
  { label: "Man of match", fields: [{ key: "manOfMatch" }], compact: true },
];

type MatchOfficialsProps = {
  values: MatchOfficialsValues;
  onEdit: (key: Key, value: string) => void;
};

export default function MatchOfficials({ values, onEdit }: MatchOfficialsProps) {
  return (
    <div className="match-officials">
      {ROWS.map((r) => (
        <div key={r.label} className={r.compact ? "mo-row mo-compact" : "mo-row"}>
          <div className="mo-cell mo-label">{r.label}</div>
          <div className="mo-cell mo-fields">
            {r.fields.map((f) => (
              <div key={f.key} className="mo-field">
                {f.label && <span className="mo-field-label">{f.label}</span>}
                <span className="mo-line">
                  <EditableText
                    value={values[f.key] ?? ""}
                    label={f.label ? `${r.label} ${f.label}` : r.label}
                    onSave={(v) => onEdit(f.key, v)}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
