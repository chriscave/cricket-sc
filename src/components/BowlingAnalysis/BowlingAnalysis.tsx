import type { BowlerRow, DeliveryMark, Over } from "./selectors";
import WideMark from "./WideMark";
import NoBallMark from "./NoBallMark";
import "./BowlingAnalysis.css";
import type { ReactNode } from "react";

const OVER_COUNT = 20;
const OVERS = Array.from({ length: OVER_COUNT }, (_, i) => i);
type TotalKey = "wds" | "nb" | "overs" | "mdns" | "runs" | "wkts" | "avrge";
const TOTALS: [TotalKey, string][] = [
  ["wds", "WDS"],
  ["nb", "NB"],
  ["overs", "Overs"],
  ["mdns", "Mdns"],
  ["runs", "Runs"],
  ["wkts", "Wkts"],
  ["avrge", "Avrge"],
];

// Header cells. Groups span several columns and are subgrids (see the CSS), so their
// sub-columns sit on the same tracks as the body cells.
type HeaderDef = { label: string; subs?: string[] };

const HEADER: HeaderDef[] = [
  { label: "" },
  { label: "Bowler" },
  { label: "Bowl. action" },
  { label: "Bowling analysis", subs: OVERS.map((i) => String(i + 1)) },
  { label: "Total", subs: TOTALS.map(([, label]) => label) },
];

function HeaderCell({ h }: { h: HeaderDef }) {
  if (h.subs) {
    return (
      <div
        className="ba-cell ba-group"
        style={{ gridColumn: `span ${h.subs.length}` }}
      >
        <div className="ba-group-label">{h.label}</div>
        {h.subs.map((s) => (
          <div key={s} className="ba-cell ba-sub">
            {s}
          </div>
        ))}
      </div>
    );
  }
  return <div className="ba-cell">{h.label}</div>;
}

function formatOvers(completed = 0, balls = 0): string {
  if (completed === 0 && balls === 0) return "";
  return balls === 0 ? `${completed}` : `${completed}.${balls}`;
}

 function renderMark(mark: DeliveryMark): ReactNode {
    if (mark.extras?.wides) return <WideMark mark={mark} />;
    if (mark.extras?.noBalls) return <NoBallMark mark={mark} />;
    return "1";
  }


function totalCell(
  row: Partial<BowlerRow>,
  key: TotalKey,
  hasBowled: boolean,
): string {
  if (!hasBowled) return "";
  if (key === "overs")
    return formatOvers(row.completedOvers, row.deliveriesInCurrentOver);
  const value = row[key];
  if ((key === "wds" || key === "nb") && value === 0) return "";
  if (key === "avrge" && value != null) return value.toFixed(2);
  return value == null ? "" : String(value);
}

function runningTotal(hasBowled: boolean, over?:Over): string {
  if (!hasBowled) return ""
  if (!over) return ""
  if (over.cumWickets === 0) return `${over.cumRuns}`
  return `${over.cumRuns}-${over.cumWickets}`
}

// Balls go down columns in groups of 3. Balls 1-3 take the first column and 4-6 the
// last; any further groups (7-9, 10-12, ...) fill the columns in between, left to right.
// e.g. 12 balls: 1-3 | 7-9 | 10-12 | 4-6
// A part-filled middle column is centred vertically. Rows are in half-steps (6 tracks,
// each ball spans 2) so two balls can sit centred between the usual 3 positions.
function ballColumns(ballCount: number): number {
  return Math.max(2, Math.ceil(ballCount / 3));
}

// Up to 4 columns fit at the normal 9px. Beyond that (13+ balls, very rare) shrink the
// marks in proportion so they get smaller rather than overlapping the next column.
function ballFontSize(columns: number): string | undefined {
  return columns > 4 ? `${(9 * 4) / columns}px` : undefined;
}

function ballPosition(ball: number, ballCount: number, columns: number) {
  const group = Math.floor(ball / 3);
  const column = group === 0 ? 1 : group === 1 ? columns : group;
  const groupSize = Math.min(3, ballCount - group * 3);
  const offset = group >= 2 ? 3 - groupSize : 0;
  return { gridColumn: column, gridRow: `${(ball % 3) * 2 + 1 + offset} / span 2` };
}

export type BowlingAnalysisProps = {
  bowlers: BowlerRow[];
};
export default function BowlingAnalysis({
  bowlers = [],
}: BowlingAnalysisProps) {
  const count = 8;
  const rows: Partial<BowlerRow>[] = Array.from(
    { length: count },
    (_, i) => bowlers[i] ?? {},
  );

  return (
    <div className="bowling">
      <div className="ba-row ba-head">
        {HEADER.map((h, i) => (
          <HeaderCell key={i} h={h} />
        ))}
      </div>

      {rows.map((row, i) => {
        const hasBowled = !!row.oversAnalysis?.length;

        return (
          <div key={i} className="ba-row ba-body">
            <div className="ba-cell ba-num">{i + 1}</div>
            <div className="ba-cell">{row.name}</div>
            <div className="ba-cell">{row.action}</div>

            {OVERS.map((o) => {
              const marks = row.oversAnalysis?.[o]?.deliveryMarks ?? [];
              const columns = ballColumns(marks.length);
              return (
              <div key={o} className="ba-cell ba-stack">
                <div
                  className="ba-half ba-balls"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    fontSize: ballFontSize(columns),
                  }}
                >
                  {marks.map((mark, b) => (
                    <span key={b} style={ballPosition(b, marks.length, columns)}>
                      {renderMark(mark)}
                    </span>
                  ))}
                </div>
                <span className="ba-half">
                  {runningTotal(hasBowled, row.oversAnalysis?.[o])}
                </span>
              </div>
              );
            })}

            {TOTALS.map(([key]) => (
              <div key={key} className="ba-cell">
                {totalCell(row, key, hasBowled)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
