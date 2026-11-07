import "./RunTracker.css";
import type { CSSProperties } from "react";
import { bowlerColour, DotMark } from "@/components/DeliveryMarks";
import type { RunTrackerData } from "./selectors";

// 50 rows of 10 numbers (1-10, 11-20, ...), down the right-hand side of the sheet.
const TOTAL = 500;
const COLUMNS = 10;

// A stroke's line and brackets in its bowler's colour, slightly see-through so the number
// still shows through.
const strikeColour = (colour: string) => `color-mix(in srgb, ${colour} 85%, transparent)`;

// The dots on a score: stacked in columns of 3, like the batting analysis, up to 3
// columns, or a small count in the corner when there are more than fit.
function Dots({ bowlers }: { bowlers: number[] }) {
  if (bowlers.length > 9) return <span className="rt-dot-count">{bowlers.length}</span>;
  return (
    <span className="rt-dots">
      {bowlers.map((id, i) => (
        <span key={i} style={{ color: bowlerColour(id) }}><DotMark /></span>
      ))}
    </span>
  );
}

/*
  strokes, dots: from selectRunTracker. Each stroke is crossed off as (---), so one that
                 wraps onto the next row still reads as one.
*/
export default function RunTracker({ strokes, dots }: RunTrackerData) {
  const numbers = Array.from({ length: TOTAL }, (_, i) => i + 1);
  const rows = Math.ceil(TOTAL / COLUMNS);
  const scored = strokes.at(-1)?.last ?? 0;
  const opens = new Set(strokes.map((s) => s.first));
  const closes = new Set(strokes.map((s) => s.last));
  // The colour of the stroke that crosses off each number.
  const strikeOf: Record<number, string> = {};
  for (const s of strokes)
    for (let n = s.first; n <= s.last; n++) strikeOf[n] = strikeColour(bowlerColour(s.bowlerId));

  return (
    <div className="run-tracker" style={{ "--cols": COLUMNS, "--rows": rows }}>
      {numbers.map((n) => {
        const className = [
          "rt-num",
          n <= scored && "rt-done",
          opens.has(n) && "rt-open",
          closes.has(n) && "rt-close",
        ].filter(Boolean).join(" ");
        return (
          <span
            key={n}
            className={className}
            style={n in strikeOf ? ({ "--strike": strikeOf[n] } as CSSProperties) : undefined}
          >
            {n}
            {n in dots && <Dots bowlers={dots[n]} />}
          </span>
        );
      })}
    </div>
  );
}
