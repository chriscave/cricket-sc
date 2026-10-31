import { isBallFaced, oversAt, runsScored, type InningsState } from "@/scoring";

// One per wicket, in the order they fell.
// score: the team's score when it fell, extras included.
// outgoing: the batter out (their number in the batting order) and their runs off the bat.
// partnership: the runs added since the last wicket (or the start of the innings), and the
//   balls faced in that time (see isBallFaced).
// over, time: the over and ball it fell on (see oversAt), and when that ball was entered.
export type FallOfWicket = {
  score: number;
  outgoing: { batterId: number; runs: number };
  partnership: { runs: number; balls: number };
  over: string;
  time: number;
};

export function selectFallOfWickets(state: InningsState): FallOfWicket[] {
  const wickets: FallOfWicket[] = [];
  let score = 0;
  let partnership = { runs: 0, balls: 0 };
  state.deliveries.forEach((d, i) => {
    score += runsScored(d);
    partnership.runs += runsScored(d);
    if (isBallFaced(d)) partnership.balls++;
    if (!d.wicket) return;
    const batterId = d.wicket.batterOutId;
    const runs = state.batters[batterId].deliveryIds
      .reduce((sum, j) => sum + state.deliveries[j].batRuns, 0);
    wickets.push({
      score,
      outgoing: { batterId, runs },
      partnership,
      over: oversAt(state, i),
      time: d.time,
    });
    partnership = { runs: 0, balls: 0 };
  });
  return wickets;
}
