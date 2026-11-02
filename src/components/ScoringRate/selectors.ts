import { runsScored, type InningsState } from "@/scoring";

// One per over the scorer has ended, index 0 = over 1. The over in progress isn't
// included, so each row is filled in at the end of its over, as in the book.
// score, wickets: the team's score and wickets fallen at the end of the over.
// bowlerId: who bowled it. runs: the runs off it, extras included.
// rate: runs per over at the end of the over: the score over the overs bowled.
export type OverRate = {
  score: number;
  wickets: number;
  bowlerId: number;
  runs: number;
  rate: number;
};

export function selectScoringRate(state: InningsState): OverRate[] {
  const overs: OverRate[] = [];
  let score = 0;
  let wickets = 0;
  for (const d of state.deliveries) {
    if (d.overNumber === state.overNumber) break; // the over in progress: not ended yet
    score += runsScored(d);
    if (d.wicket) wickets++;
    const over = (overs[d.overNumber - 1] ??= { score, wickets, bowlerId: d.bowlerId, runs: 0, rate: 0 });
    over.runs += runsScored(d);
    over.score = score;
    over.wickets = wickets;
    over.rate = score / d.overNumber;
  }
  return overs;
}
