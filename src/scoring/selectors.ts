import { creditedToBowler } from "./dismissals";
import type { Delivery, InningsState } from "./types";

export const isLegal = (d: Delivery) =>
  d.extras.wides === 0 && d.extras.noBalls === 0;

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
