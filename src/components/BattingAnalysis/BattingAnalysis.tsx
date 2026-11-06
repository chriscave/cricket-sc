import "./BattingAnalysis.css";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { bowlerColour, renderMark } from "@/components/DeliveryMarks";
import Clock from "@/components/Clock";
import EditableText from "@/components/EditableText";
import RowToggle from "@/components/RowToggle";
import { batterName, bowlerName, DISMISSALS, type Names, type Rename } from "@/scoring";
import { isDot, type BatterRow, type BattingColumn } from "./selectors";

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
  { label: "Min" },
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

// A cell split into two stacked halves.
function Stack({ top, bottom }: { top?: ReactNode; bottom?: ReactNode }) {
  return (
    <div className="sc-cell sc-stack">
      <span className="sc-half">{top}</span>
      <span className="sc-half">{bottom}</span>
    </div>
  );
}

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
            <span
              key={j}
              className={isDot(mark) ? "sc-ball sc-dot" : "sc-ball"}
              style={{ color: bowlerColour(mark.bowlerId) }}
            >
              {renderMark(mark)}
            </span>
          ))}
        </div>
      ))}
      {out && <OutStrikes />}
    </div>
  );
}

// A batter's row is open (everything showing) or closed (one short line: name, how out,
// bowler and total). Batters who haven't come in are closed, the two in are open, and a
// batter closes when they're out. The two in are always open, so it's clear who's batting;
// the scorer can reopen (and close again) a batter who's out.
const isIn = (row: Partial<BatterRow>) => !!row.hasBatted && row.howOut === undefined;
const isOut = (row: Partial<BatterRow>) => row.howOut !== undefined;

// The cells a closed row leaves blank: In, Out, runs, 4s/6s, 50, 100, Min.
const CLOSED_BLANKS = 7;

// Pass real data as `innings`; empty slots render as blank scorebook lines.
export default function BattingAnalysis({
  innings = [],
  batters = 11,
  names,
  onRename,
}: {
  innings?: BatterRow[];
  batters?: number;
  names: Names;
  onRename: Rename;
}) {
  const rows: Partial<BatterRow>[] = Array.from(
    { length: batters },
    (_, i) => innings[i] ?? {},
  );
  // The batters who are out that the scorer has reopened. Out is final, so a reopen never
  // goes stale.
  const [reopened, setReopened] = useState<ReadonlySet<number>>(new Set());
  const toggle = (id: number) =>
    setReopened((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <div className="scorecard">
      <div className="sc-row sc-head">
        {HEADER.map((h, i) => <HeaderCell key={i} h={h} />)}
      </div>

      {/* Cells in order. MUST match grid-template-columns in the CSS. */}
      {rows.map((row, i) => {
        const id = i + 1;
        const open = isIn(row) || (isOut(row) && reopened.has(id));
        return (
        <div key={i} className={open ? "sc-row sc-body" : "sc-row sc-body sc-closed"}>
          <div className="sc-cell sc-num">
            {isOut(row) ? (
              <RowToggle id={id} open={open} what="batter" onToggle={() => toggle(id)} />
            ) : (
              id
            )}
            {row.onStrike && <span className="sc-strike" aria-label="on strike">†</span>}
          </div>
          <div className="sc-cell">
            {/* Can be named before they come in. The default shows once they have. */}
            <EditableText
              value={names.batters[id] ?? ""}
              shown={row.hasBatted || names.batters[id] ? batterName(names, id) : ""}
              label={`Batter ${id} name`}
              onSave={(name) => onRename("batters", id, name)}
            />
          </div>
          {open ? (
            <>
              <Stack top={<Clock at={row.timeIn} className="sc-time" />} bottom={row.overIn} />
              <Stack top={<Clock at={row.timeOut} className="sc-time" />} bottom={row.overOut} />
              <RunsCell columns={row.columns ?? []} out={row.howOut !== undefined} />
              <Stack top={row.fours || undefined} bottom={row.sixes || undefined} />
              <Stack top={row.ballsTo50} bottom={row.minutesTo50} />
              <Stack top={row.ballsTo100} bottom={row.minutesTo100} />
              <div className="sc-cell sc-minutes">{row.minutes}</div>
            </>
          ) : (
            Array.from({ length: CLOSED_BLANKS }, (_, k) => <div key={k} className="sc-cell" />)
          )}
          <div className="sc-cell sc-bottom">
            {row.howOut ? DISMISSALS[row.howOut].label : row.hasBatted && "Not Out"}
          </div>
          <div
            className="sc-cell sc-bottom"
            style={{ color: row.bowlerId === undefined ? undefined : bowlerColour(row.bowlerId) }}
          >
            {row.bowlerId && bowlerName(names, row.bowlerId)}
          </div>
          <div className="sc-cell sc-total">
            {row.hasBatted && (
              <span>
                <span className="sc-score">{row.total}</span> ({row.balls})
              </span>
            )}
          </div>
        </div>
        );
      })}

    </div>
  );
}