import "./MatchHeader.css";

// Both rows sit on the same 5 tracks (see grid-template-columns in the CSS).
// `span` says how many tracks a cell covers. `kind` marks the two cells that aren't a plain label + value.
const ROW_1 = [
  { key: "matchNo", label: "Match no.",  span: 1 },
  { kind: "clubs",                       span: 2 },
  { key: "venue",   label: "Venue",      span: 1 },
  { key: "dayDate", label: "Day & date", span: 1 },
];

const ROW_2 = [
  { key: "tossWonBy",   label: "Toss won by",   span: 2 },
  { key: "inningsOf",   label: "Innings of",    span: 1 },
  { key: "typeOfMatch", label: "Type of match", span: 1 },
  { kind: "time",                               span: 1 },
];

function Cell({ field, values }) {
  const style = { gridColumn: `span ${field.span}` };

  // "Played between  [club] C. club AND [club] C. club"
  if (field.kind === "clubs") {
    return (
      <div className="mh-cell mh-clubs" style={style}>
        <span className="mh-label">Played between</span>
        <span className="mh-value">{values.homeClub}</span>
        <span className="mh-small">C. club</span>
        <span className="mh-and">AND</span>
        <span className="mh-value">{values.awayClub}</span>
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
            <span className="mh-value">{values.start}</span>
          </div>
          <div className="mh-half">
            <span className="mh-small">Finish</span>
            <span className="mh-value">{values.finish}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mh-cell" style={style}>
      <span className="mh-label">{field.label}</span>
      <span className="mh-value">{values[field.key]}</span>
    </div>
  );
}

/*
  values: { matchNo, homeClub, awayClub, venue, dayDate,
            tossWonBy, inningsOf, typeOfMatch, start, finish }
*/
export default function MatchHeader({ values = {} }) {
  return (
    <div className="match-header">
      <div className="mh-row mh-row-1">
        {ROW_1.map((f, i) => <Cell key={i} field={f} values={values} />)}
      </div>
      <div className="mh-row mh-row-2">
        {ROW_2.map((f, i) => <Cell key={i} field={f} values={values} />)}
      </div>
    </div>
  );
}