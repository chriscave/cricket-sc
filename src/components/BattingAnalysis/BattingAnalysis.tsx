import "./BattingAnalysis.css";

// Body columns. Order MUST match grid-template-columns in the CSS.
// `split: [topKey, bottomKey]` renders the cell as two stacked halves.
const COLUMNS = [
  { key: "num", cls: "sc-num" },
  { key: "name" },
  { key: "in",    split: ["inTime", "inOver"] },
  { key: "out",   split: ["outTime", "outOver"] },
  { key: "runs",  split: ["runsTop", "runsBottom"] },
  { key: "fours", split: ["fours", "sixes"] },
  { key: "b50",   split: ["b50Balls", "b50Min"] },
  { key: "b100",  split: ["b100Balls", "b100Min"] },
  { key: "timeIn" },
  { key: "how" },
  { key: "bowler" },
  { key: "total" },
];

// Header cells, one per column, except grouped ones that span several.
//   subs:  a label on top with sub-labels underneath, one per spanned column
//   stack: two labels stacked in one column (4s over 6s)
const HEADER = [
  { label: "" },
  { label: "Batsman" },
  { label: "Time/Over", subs: ["In", "Out"] },
  { label: "" },
  { stack: ["4s", "6s"] },
  { label: "Balls/Min", subs: ["50", "100"] },
  { label: "Time in" },
  { label: "How out" },
  { label: "Bowler" },
  { label: "Total" },
];

function HeaderCell({ h }) {
  if (h.subs) {
    return (
      <div className="sc-cell sc-group" style={{ gridColumn: `span ${h.subs.length}` }}>
        <div className="sc-group-label">{h.label}</div>
        {h.subs.map((s) => <div key={s} className="sc-cell sc-sub">{s}</div>)}
      </div>
    );
  }
  if (h.stack) {
    return (
      <div className="sc-cell sc-stack">
        {h.stack.map((s) => <span key={s} className="sc-half">{s}</span>)}
      </div>
    );
  }
  return <div className="sc-cell">{h.label}</div>;
}

// Pass real data as `innings`; empty slots render as blank scorebook lines.
export default function BattingAnalysis({ innings = [], batters = 11 }) {
  const rows = Array.from({ length: batters }, (_, i) => innings[i] ?? {});

  return (
    <div className="scorecard">
      <div className="sc-row sc-head">
        {HEADER.map((h, i) => <HeaderCell key={i} h={h} />)}
      </div>

      {rows.map((row, i) => (
        <div key={i} className="sc-row sc-body">
          {COLUMNS.map((c) =>
            c.split ? (
              <div key={c.key} className="sc-cell sc-stack">
                <span className="sc-half">{row[c.split[0]]}</span>
                <span className="sc-half">{row[c.split[1]]}</span>
              </div>
            ) : (
              <div key={c.key} className={`sc-cell ${c.cls ?? ""}`}>
                {c.key === "num" ? i + 1 : row[c.key]}
              </div>
            )
          )}
        </div>
      ))}

    </div>
  );
}