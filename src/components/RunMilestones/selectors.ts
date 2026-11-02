import { clockMinutes, isBallFaced, runsScored, type InningsState } from "@/scoring";

// When the team reached a milestone: the time of the ball that took them there, the
// minutes since the first ball of the innings, and the balls faced up to and including it
// (see isBallFaced).
export type RunMilestone = { time: number; minutes: number; balls: number };

// Every 50 the team has reached so far, keyed by the score: 50, 100 ...
export function selectRunMilestones(state: InningsState): Record<number, RunMilestone> {
  const reached: Record<number, RunMilestone> = {};
  let score = 0;
  let balls = 0;
  let next = 50;
  for (const d of state.deliveries) {
    score += runsScored(d);
    if (isBallFaced(d)) balls++;
    while (score >= next) {
      reached[next] = { time: d.time, minutes: clockMinutes(state.deliveries[0].time, d.time), balls };
      next += 50;
    }
  }
  return reached;
}
