// A bye: a triangle pointing up. A leg bye: the same triangle pointing down. The
// mark is the same however many runs were taken.
const TRIANGLES = {
  bye: "1,10.3 11,10.3 6,1.7",
  legBye: "1,1.7 11,1.7 6,10.3",
};

export default function ByeMark({ kind }: { kind: "bye" | "legBye" }) {
  return (
    <svg
      className="ba-mark"
      viewBox="0 0 12 12"
      aria-label={kind === "bye" ? "bye" : "leg bye"}
    >
      <polygon
        points={TRIANGLES[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
