import "./MatchOfficials.css";
import EditableText from "@/components/EditableText";

export type MatchOfficialsValues = {
  umpire1?: string;
  umpire2?: string;
  scorer1?: string;
  scorer2?: string;
  homeCaptain?: string;
  visitCaptain?: string;
  manOfMatch?: string;
};
type Key = keyof MatchOfficialsValues;
type Row = { label: string; fields: { key: Key; label?: string }[]; compact?: boolean };

// One entry per block in the book. A block with several fields stacks them,
// each on its own ruled line, with a small label if it needs one (Capts. has Home and Visit).
const ROWS: Row[] = [
  { label: "Umpires",      fields: [{ key: "umpire1" }, { key: "umpire2" }] },
  { label: "Scorers",      fields: [{ key: "scorer1" }, { key: "scorer2" }] },
  { label: "Capts.",       fields: [{ key: "homeCaptain", label: "Home" }, { key: "visitCaptain", label: "Visit" }] },
  { label: "Man of match", fields: [{ key: "manOfMatch" }], compact: true },
];

// "Capts. Home", "Umpires 2", or just "Man of match" for a block with one line.
const screenReaderLabel = (r: Row, f: Row["fields"][number], i: number) =>
  f.label ? `${r.label} ${f.label}` : r.fields.length > 1 ? `${r.label} ${i + 1}` : r.label;

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
            {r.fields.map((f, i) => (
              <div key={f.key} className="mo-field">
                {f.label && <span className="mo-field-label">{f.label}</span>}
                <span className="mo-line">
                  <EditableText
                    value={values[f.key] ?? ""}
                    label={screenReaderLabel(r, f, i)}
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
