import { runsScored, type InningsState } from "@/scoring";

// strokes: each scoring ball, as the first and last number it crosses off and who bowled
//   it. A 4 at 10 is first 11, last 14.
// dots: balls that didn't move the score (wickets included), as who bowled each one, on the
//   next number to be crossed off. Dots at 0 go on 1, dots at 10 go on 11.
export type RunTrackerData = {
  strokes: { first: number; last: number; bowlerId: number }[];
  dots: Record<number, number[]>;
};

export function selectRunTracker(state: InningsState): RunTrackerData {
  const strokes: RunTrackerData["strokes"] = [];
  const dots: RunTrackerData["dots"] = {};
  let score = 0;
  for (const d of state.deliveries) {
    const runs = runsScored(d);
    if (runs === 0) {
      (dots[score + 1] ??= []).push(d.bowlerId);
    } else {
      strokes.push({ first: score + 1, last: score + runs, bowlerId: d.bowlerId });
      score += runs;
    }
  }
  return { strokes, dots };
}
