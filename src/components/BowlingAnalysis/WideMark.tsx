import type { DeliveryMark } from "./selectors";
import { WicketLetter } from "./WicketMark";

// Quadrant centres of the cross, in fill order: top-left, top-right, bottom-left,
// bottom-right.
const CORNERS = [
  [3, 3],
  [9, 3],
  [3, 9],
  [9, 9],
];

// A wide: a "+" with one dot per extra wide in the corners. A wicket to the bowler
// (stumped, hit wicket) puts a W in the first corner.
export default function WideMark({ mark }: { mark: DeliveryMark }) {
  const extraWides = Math.max(0, mark.extras.wides - 1);
  const corners: ("W" | "dot")[] = [
    ...(mark.bowlerWicket ? (["W"] as const) : []),
    ...Array<"dot">(extraWides).fill("dot"),
  ].slice(0, CORNERS.length);

  return (
    <svg className="ba-mark" viewBox="0 0 12 12" aria-label="wide">
      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1" />
      {corners.map((c, i) => {
        const [x, y] = CORNERS[i];
        return c === "dot" ? (
          <circle key={i} cx={x} cy={y} r="1.4" fill="currentColor" />
        ) : (
          <WicketLetter key={i} x={x} y={y} size={5} />
        );
      })}
    </svg>
  );
}
