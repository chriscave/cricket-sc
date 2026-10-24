import "./RunTracker.css";
import { DotMark } from "@/components/DeliveryMarks";
import type { RunTrackerData } from "./selectors";

// 10 rows of 40 numbers.
const TOTAL = 400;
const COLUMNS = 40;

// The dots on a score: stacked in columns of 3, like the batting analysis, up to 3
// columns, or a small count in the corner when there are more than fit.
function Dots({ count }: { count: number }) {
  if (count > 9) return <span className="rt-dot-count">{count}</span>;
  return (
    <span className="rt-dots">
      {Array.from({ length: count }, (_, i) => <DotMark key={i} />)}
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
  const scored = strokes.at(-1)?.[1] ?? 0;
  const opens = new Set(strokes.map(([first]) => first));
  const closes = new Set(strokes.map(([, last]) => last));

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
          <span key={n} className={className}>
            {n}
            {n in dots && <Dots count={dots[n]} />}
          </span>
        );
      })}
    </div>
  );
}
