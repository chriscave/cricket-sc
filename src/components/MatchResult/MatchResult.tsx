import "./MatchResult.css";
import EditableText from "@/components/EditableText";

export type MatchResultValues = {
  result?: string;
  homePoints?: string;
  awayPoints?: string;
};
type Key = keyof MatchResultValues;
type Row = { label: string; fields: { key: Key; label?: string }[] };

// Two lines. Each row has a label, then one or more ruled fields.
// A field with its own `label` shows it after the value: "[ value ] Home team".
const ROWS: Row[] = [
  { label: "Result", fields: [{ key: "result" }] },
  {
    label: "Points",
    fields: [
      { key: "homePoints", label: "Home team" },
      { key: "awayPoints", label: "Away team" },
    ],
  },
];

type MatchResultProps = {
  values: MatchResultValues;
  onEdit: (key: Key, value: string) => void;
};

export default function MatchResult({ values, onEdit }: MatchResultProps) {
  return (
    <div className="match-result">
      {ROWS.map((r) => (
        <div key={r.label} className="mr-row">
          <div className="mr-cell mr-label">{r.label}</div>
          {r.fields.map((f) => (
            <div key={f.key} className="mr-cell mr-field">
              <span className="mr-value">
                <EditableText
                  value={values[f.key] ?? ""}
                  label={f.label ? `${r.label} ${f.label}` : r.label}
                  onSave={(v) => onEdit(f.key, v)}
                />
              </span>
              {f.label && <span className="mr-small">{f.label}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
