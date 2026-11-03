import "./MatchHeader.css";
import EditableText from "@/components/EditableText";

export type MatchHeaderValues = {
  matchNo?: string;
  homeClub?: string;
  awayClub?: string;
  venue?: string;
  dayDate?: string;
  tossWonBy?: string;
  inningsOf?: string;
  typeOfMatch?: string;
  start?: string;
  finish?: string;
};
type Key = keyof MatchHeaderValues;
type OnEdit = (key: Key, value: string) => void;

// Both rows sit on the same 5 tracks (see grid-template-columns in the CSS).
// `span` says how many tracks a cell covers. `kind` marks the two cells that aren't a plain label + value.
type Field =
  | { kind?: undefined; key: Key; label: string; span: number }
  | { kind: "clubs"; span: number }
  | { kind: "time"; span: number };

const ROW_1: Field[] = [
  { key: "matchNo", label: "Match no.",  span: 1 },
  { kind: "clubs",                       span: 2 },
  { key: "venue",   label: "Venue",      span: 1 },
  { key: "dayDate", label: "Day & date", span: 1 },
];

const ROW_2: Field[] = [
  { key: "tossWonBy",   label: "Toss won by",   span: 2 },
  { key: "inningsOf",   label: "Innings of",    span: 1 },
  { key: "typeOfMatch", label: "Type of match", span: 1 },
  { kind: "time",                               span: 1 },
];

type CellProps = { field: Field; values: MatchHeaderValues; onEdit: OnEdit };

function Cell({ field, values, onEdit }: CellProps) {
  const style = { gridColumn: `span ${field.span}` };
  // A ruled line the scorer can click and write on.
  const line = (key: Key, label: string) => (
    <span className="mh-value">
      <EditableText value={values[key] ?? ""} label={label} onSave={(v) => onEdit(key, v)} />
    </span>
  );

  // "Played between  [club] C. club AND [club] C. club"
  if (field.kind === "clubs") {
    return (
      <div className="mh-cell mh-clubs" style={style}>
        <span className="mh-label">Played between</span>
        {line("homeClub", "Home club")}
        <span className="mh-small">C. club</span>
        <span className="mh-and">AND</span>
        {line("awayClub", "Away club")}
        <span className="mh-small">C. club</span>
      </div>
    );
  }

  // "Time" with Start and Finish stacked
  if (field.kind === "time") {
    return (
      <div className="mh-cell mh-time" style={style}>
        <span className="mh-label">Time</span>
        <div className="mh-stack">
          <div className="mh-half">
            <span className="mh-small">Start</span>
            {line("start", "Start time")}
          </div>
          <div className="mh-half">
            <span className="mh-small">Finish</span>
            {line("finish", "Finish time")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mh-cell" style={style}>
      <span className="mh-label">{field.label}</span>
      {line(field.key, field.label)}
    </div>
  );
}

type MatchHeaderProps = { values: MatchHeaderValues; onEdit: OnEdit };

export default function MatchHeader({ values, onEdit }: MatchHeaderProps) {
  return (
    <div className="match-header">
      <div className="mh-row mh-row-1">
        {ROW_1.map((f, i) => <Cell key={i} field={f} values={values} onEdit={onEdit} />)}
      </div>
      <div className="mh-row mh-row-2">
        {ROW_2.map((f, i) => <Cell key={i} field={f} values={values} onEdit={onEdit} />)}
      </div>
    </div>
  );
}
