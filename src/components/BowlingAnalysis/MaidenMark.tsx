import { useId } from "react";
import type { DeliveryMark } from "./selectors";

// Centres of the 6 balls of a maiden, as % of the balls area: 2 columns of 3.
const BALLS = [
  ["25%", "16.67%"],
  ["25%", "50%"],
  ["25%", "83.33%"],
  ["75%", "16.67%"],
  ["75%", "50%"],
  ["75%", "83.33%"],
];

// The M, bottom-left up to top-left, down to the middle, up to top-right, down to
// bottom-right.
const M = [BALLS[2], BALLS[0], ["50%", "50%"], BALLS[3], BALLS[5]];

// The W, top-left down to bottom-left, up to the middle, down to bottom-right, up to
// top-right.
const W = [BALLS[0], BALLS[2], ["50%", "50%"], BALLS[5], BALLS[3]];

// A maiden: an M joining the balls, or a W for a wicket maiden (one the bowler took a
// wicket in; a run out doesn't count). It runs straight through the dots, and sits
// behind the other marks (byes, leg byes, wickets), cut away around them so it never
// covers them.
export default function MaidenMark({ marks }: { marks: DeliveryMark[] }) {
  const mask = useId();
  const wicketMaiden = marks.some((m) => m.bowlerWicket);
  const shape = wicketMaiden ? W : M;
  return (
    <svg
      className="ba-maiden"
      aria-label={wicketMaiden ? "wicket maiden" : "maiden"}
    >
      <mask id={mask}>
        <rect width="100%" height="100%" fill="white" />
        {marks.slice(0, BALLS.length).map((m, i) => {
          const isDot = !m.extras && !m.bowlerWicket && !m.runOut;
          if (isDot) return null;
          const [cx, cy] = BALLS[i];
          return <circle key={i} cx={cx} cy={cy} r="0.5em" fill="black" />;
        })}
      </mask>
      <g mask={`url(#${mask})`} stroke="currentColor" strokeWidth="0.1em">
        {shape.slice(1).map(([x2, y2], i) => {
          const [x1, y1] = shape[i];
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}
