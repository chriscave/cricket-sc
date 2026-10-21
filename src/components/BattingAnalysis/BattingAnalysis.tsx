import "./BattingAnalysis.css";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { renderMark } from "@/components/DeliveryMarks";
import { isDot, type BatterRow, type BattingColumn } from "./selectors";

// Body columns. Order MUST match grid-template-columns in the CSS.
// `split: [topKey, bottomKey]` renders the cell as two stacked halves.
const COLUMNS = [
  { key: "num", cls: "sc-num" },
  { key: "name" },
  { key: "in",    split: ["inTime", "inOver"] },
  { key: "out",   split: ["outTime", "outOver"] },
  { key: "runs" },
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

// Only the runs column has data so far. The other columns are looked up by key and stay
// blank until their fields are added to BatterRow.
const field = (row: object, key: string) => (row as Record<string, ReactNode>)[key];

// The runs as scored, one column per 3 dot balls, or 2 balls once a run or another mark
// is in it. The columns fill the top half left to right, then wrap into the bottom half.
// The // after a batter's last ball once they're out. It crosses both halves of the row
// when the innings ends in the top half, and only its own line otherwise. Which line
// it's on is only known after layout, so it's measured.
function OutStrikes() {
  const ref = useRef<HTMLSpanElement>(null);
  const [acrossBoth, setAcrossBoth] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setAcrossBoth(el.offsetTop < el.offsetHeight);
  });
  return (
    <span ref={ref} className={acrossBoth ? "sc-out sc-out-both" : "sc-out"}>
      <svg viewBox="0 0 10 10" preserveAspectRatio="none" aria-label="out">
        <path d="M0 10L5 0M5 10L10 0" stroke="currentColor" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

function RunsCell({ columns, out }: { columns: BattingColumn[]; out: boolean }) {
  return (
    <div className="sc-cell sc-runs">
      {columns.map((col, i) => (
        <div key={i} className={col.every(isDot) ? "sc-runs-col sc-dots" : "sc-runs-col sc-halves"}>
          {col.map((mark, j) => (
            <span key={j} className={isDot(mark) ? "sc-ball sc-dot" : "sc-ball"}>
              {renderMark(mark)}
            </span>
          ))}
        </div>
      ))}
      {out && <OutStrikes />}
    </div>
  );
}

// Pass real data as `innings`; empty slots render as blank scorebook lines.
export default function BattingAnalysis({
  innings = [],
  batters = 11,
}: {
  innings?: BatterRow[];
  batters?: number;
}) {
  const rows: Partial<BatterRow>[] = Array.from(
    { length: batters },
    (_, i) => innings[i] ?? {},
  );

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
                <span className="sc-half">{field(row, c.split[0])}</span>
                <span className="sc-half">{field(row, c.split[1])}</span>
              </div>
            ) : c.key === "runs" ? (
              <RunsCell key={c.key} columns={row.columns ?? []} out={row.out ?? false} />
            ) : (
              <div key={c.key} className={`sc-cell ${c.cls ?? ""}`}>
                {c.key === "num" ? i + 1 : field(row, c.key)}
              </div>
            )
          )}
        </div>
      ))}

    </div>
  );
}