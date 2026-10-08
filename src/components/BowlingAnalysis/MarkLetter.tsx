// The W (wicket) or R (run out) drawn inside a mark. Shared so the letters look the
// same wherever they appear.
export default function MarkLetter({
  letter,
  x,
  y,
  size,
}: {
  letter: "W" | "R";
  x: number;
  y: number;
  size: number;
}) {
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
      {letter}
    </text>
  );
}
