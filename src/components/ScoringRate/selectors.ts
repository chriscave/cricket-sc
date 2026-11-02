import { runsScored, type InningsState } from "@/scoring";

// One per over, index 0 = over 1, including the over in progress.
// score, wickets: the team's score and wickets fallen at the end of the over (or so far).
// bowlerId: who bowled it. runs: the runs off it, extras included.
export type OverRate = { score: number; wickets: number; bowlerId: number; runs: number };

export function selectScoringRate(state: InningsState): OverRate[] {
  const overs: OverRate[] = [];
  let score = 0;
  let wickets = 0;
  for (const d of state.deliveries) {
    score += runsScored(d);
    if (d.wicket) wickets++;
    const over = (overs[d.overNumber - 1] ??= { score, wickets, bowlerId: d.bowlerId, runs: 0 });
    over.runs += runsScored(d);
    over.score = score;
    over.wickets = wickets;
  }
  return overs;
}
