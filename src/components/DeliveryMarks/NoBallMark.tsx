import type { DeliveryMark } from "./deliveryMark";

// Dot layouts inside the circle, by dot count. One dot sits in the centre, two sit
// side by side across the middle, three form a triangle (two on top, one below) and
// four fill the corners.
const DOTS = [
  [],
  [[6, 6]],
  [[4.5, 6], [7.5, 6]],
  [[4.5, 4.5], [7.5, 4.5], [6, 7.5]],
  [[4.5, 4.5], [7.5, 4.5], [4.5, 7.5], [7.5, 7.5]],
];

// A no ball: a circle. Runs off the bat go inside it as a number. Runs not off the
// bat (extra no balls run, byes, leg byes) go inside as one dot each.
export default function NoBallMark({ mark }: { mark: DeliveryMark }) {
  const extraRuns =
    Math.max(0, mark.extras.noBalls - 1) + mark.extras.byes + mark.extras.legByes;
  const dots = DOTS[Math.min(extraRuns, DOTS.length - 1)];

  return (
    <svg className="dm-mark" viewBox="0 0 12 12" aria-label="no ball">
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      {mark.batRuns > 0 ? (
        <text
          x="6"
          y="6"
          fontSize="6"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
        >
          {mark.batRuns}
        </text>
      ) : (
        dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.1" fill="currentColor" />
        ))
      )}
    </svg>
  );
}
