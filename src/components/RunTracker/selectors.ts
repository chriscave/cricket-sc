import { runsScored, type InningsState } from "@/scoring";

// strokes: each scoring ball, as the first and last number it crosses off. A 4 at 10 is [11, 14].
// dots: balls that didn't move the score (wickets included), counted on the next number to
//   be crossed off. Dots at 0 go on 1, dots at 10 go on 11.
export type RunTrackerData = {
  strokes: [number, number][];
  dots: Record<number, number>;
};

export function selectRunTracker(state: InningsState): RunTrackerData {
  const strokes: [number, number][] = [];
  const dots: Record<number, number> = {};
  let score = 0;
  for (const d of state.deliveries) {
    const runs = runsScored(d);
    if (runs === 0) {
      dots[score + 1] = (dots[score + 1] ?? 0) + 1;
    } else {
      strokes.push([score + 1, score + runs]);
      score += runs;
    }
  }
  return { strokes, dots };
}
