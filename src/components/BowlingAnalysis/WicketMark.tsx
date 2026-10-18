// The W drawn inside a mark: filling a wicket mark, or in the corner of a wide. Shared
// so it looks the same wherever it appears.
export function WicketLetter({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight="bold"
      textAnchor="middle"
      dominantBaseline="central"
      fill="currentColor"
    >
      W
    </text>
  );
}

// A wicket to the bowler: a W that fills the mark and matches the one drawn in a wide.
// A run out gets no mark of its own; the ball shows as if it hadn't happened.
export default function WicketMark() {
  return (
    <svg className="ba-mark" viewBox="0 0 12 12" aria-label="wicket">
      <WicketLetter x={6} y={6} size={11} />
    </svg>
  );
}
