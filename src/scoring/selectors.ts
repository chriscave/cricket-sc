import { creditedToBowler } from "./dismissals";
import type { Delivery, InningsState } from "./types";

export const isLegal = (d: Delivery) =>
  d.extras.wides === 0 && d.extras.noBalls === 0;

// Whether the batter on strike faced the ball: everything but a wide. A no ball counts,
// since the batter can hit it; a wide is out of their reach.
export const isBallFaced = (d: Delivery) => d.extras.wides === 0;

// All the runs from a ball: off the bat and every kind of extra.
export const runsScored = (d: Delivery) =>
  d.batRuns + d.extras.wides + d.extras.noBalls + d.extras.byes + d.extras.legByes;

// The deliveries bowled so far in the over currently in progress.
export const currentOverDeliveries = (state: InningsState) =>
  state.deliveries.filter((d) => d.overNumber === state.overNumber);

// Whether an over has had at least 6 legal balls. Overs can run short or long when
// the umpire miscounts, so this doesn't mean the over has ended.
export const hasSixLegalDeliveries = (over: Delivery[]) =>
  over.filter(isLegal).length >= 6;

// Whether the most recent ball took a wicket credited to the bowler.
export const hasBowlerWicketFallen = (state: InningsState) => {
  const wicket = state.deliveries.at(-1)?.wicket;
  return wicket !== undefined && creditedToBowler(wicket.howOut);
};

export const batsmanOnStrike = (state: InningsState) => state.strikerId;

export const batsmanOffStrike = (state: InningsState) => state.nonStrikerId;

export const bowlersUsed = (state: InningsState): number[] =>
  Object.entries(state.bowlers)
    .filter(([, b]) => b.deliveryIds.length > 0)
    .map(([id]) => Number(id));

// The bowler of the most recent ball, or undefined before the first ball.
export const previousDeliveryBowlerId = (state: InningsState) =>
  state.deliveries.at(-1)?.bowlerId;

// The bowler of the over before the current one. Normally that's the bowler at the
// other end, who bowls the next over. Undefined during the first over.
export const otherEndBowlerId = (state: InningsState) =>
  state.deliveries.findLast((d) => d.overNumber === state.overNumber - 1)
    ?.bowlerId;

// The wickets that have fallen so far.
// TODO: add support for batters retiring. A batter retired out counts as a wicket, but
// a batter retired hurt (not out) doesn't.
export const wicketsFallen = (state: InningsState) =>
  state.deliveries.filter((d) => d.wicket).length;

// Whether the innings has ended: 10 wickets have fallen, so the side is all out.
export const isInningsOver = (state: InningsState) => wicketsFallen(state) >= 10;

// Overs bowled, as written in the book: the overs the scorer has ended, then a dot and the
// legal balls of the over in progress, so 12 overs and 3 balls is "12.3". An over only
// counts once the scorer ends it, because the umpire can miscount: until then a 7 ball
// over reads "12.7".
export const oversBowled = (state: InningsState) => {
  const complete = state.overNumber - 1;
  const balls = currentOverDeliveries(state).filter(isLegal).length;
  return balls === 0 ? String(complete) : `${complete}.${balls}`;
};

// The ball at `index`, written over.ball like the fall of wickets on a scorecard: the overs
// the scorer had ended, then which ball of the over was being bowled. A wicket on the 2nd
// ball of the innings is "0.2". A wide or no ball doesn't count, so it gets the number of
// the ball still to come: a stumping off a wide after 4 legal balls is "0.5", the same as
// the ball bowled again after it.
export const oversAt = (state: InningsState, index: number) => {
  const ball = state.deliveries[index];
  const balls = state.deliveries
    .slice(0, index)
    .filter((d) => d.overNumber === ball.overNumber && isLegal(d)).length;
  return `${ball.overNumber - 1}.${balls + 1}`;
};
