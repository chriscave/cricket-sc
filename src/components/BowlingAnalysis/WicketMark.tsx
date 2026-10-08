import MarkLetter from "./MarkLetter";

// A wicket: W when the bowler takes it, R for a run out. The letter fills the mark and
// matches the one drawn in a wide.
export default function WicketMark({ kind }: { kind: "bowler" | "runOut" }) {
  return (
    <svg
      className="ba-mark"
      viewBox="0 0 12 12"
      aria-label={kind === "bowler" ? "wicket" : "run out"}
    >
      <MarkLetter letter={kind === "bowler" ? "W" : "R"} x={6} y={6} size={11} />
    </svg>
  );
}
