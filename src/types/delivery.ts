export interface Extras {
  wides?: number;
  noBalls?: number;
  byes?: number;
  legByes?: number;
}

export type HowOut =
  | { kind: "bowled" }
  | { kind: "lbw" }
  | { kind: "hitWicket" }
  | { kind: "timedOut" }
  | { kind: "caught"; fielder: string }
  | { kind: "stumped"; keeper: string }
  | { kind: "runOut"; fielder?: string };

export interface Wicket {
  batterOutId: number;
  howOut: HowOut;
}

export interface Delivery {
  overNumber: number;
  // bowlerId: number;
  // strikerId: number;
  batRuns: number;
  extras?: Extras;
  wicket?: Wicket;
  time: number;
}

export interface DeliveryInput {
  batRuns?: number;
  extras?: Extras;
  wicket?: Wicket;
}

// export interface DeliveryContext {
//   overNumber: number;
//   bowlerId: number;
//   batterId: number;
// }

export type MatchEvent =
  | { type: "deliveryBowled"; delivery: Delivery }
  | { type: "endOver"; nextBowlerId: number }
  | { type: "penaltyRunsAwarded"; runs: number };
// | {
//     type: "batterCameIn";
//     batterId: number;
//     end: "striker" | "nonStriker";
//     time: string;
//   }
// | { type: "bowlerChanged"; bowlerId: number }
// | {
//     type: "batterRetired";
//     batterId: number;
//     reason: "hurt" | "other";
//     time: string;
//   }

export type Events = MatchEvent[];

export interface InningsState {
  deliveries: Delivery[];
  batters: Record<number, { deliveryIds: number[] }>;
  bowlers: Record<number, { deliveryIds: number[] }>;
  overNumber: number;
  currentBowlerId: number;
  strikerId?: number;
  nonStrikerId?: number;
  penalties?: number[];
}

export function apply(
  state: InningsState,
  matchEvent: MatchEvent,
): InningsState {
  let nextState: InningsState = {
    deliveries: state.deliveries,
    batters: state.batters,
    bowlers: state.bowlers,
    overNumber: state.overNumber,
    currentBowlerId: state.currentBowlerId,
    strikerId: state.strikerId,
    nonStrikerId: state.nonStrikerId,
    penalties: state.penalties,
    // current: state.current,
  };
  if (matchEvent.type === "deliveryBowled") {
    nextState.deliveries.push(matchEvent.delivery);
    const deliveryId = nextState.deliveries.length - 1;
    const bowlerId = state.currentBowlerId;

    // const bowlerId = matchEvent.delivery.bowlerId;
    const strikerId = state.strikerId;
    const nonStrikerId = state.nonStrikerId;

    // const strikerId = matchEvent.delivery.strikerId;
    // const nonStrikerId = matchEvent.delivery.nonStrikerId;
    nextState.batters[strikerId].deliveryIds.push(deliveryId);
    nextState.bowlers[bowlerId].deliveryIds.push(deliveryId);

    const byes = matchEvent.delivery.extras?.byes ?? 0;
    const legByes = matchEvent.delivery.extras?.legByes ?? 0;
    const wides = matchEvent.delivery.extras?.wides ?? 0;
    const noBalls = matchEvent.delivery.extras?.noBalls ?? 0;

    const swapEnds =
      matchEvent.delivery.batRuns % 2 === 1 ||
      byes % 2 === 1 ||
      legByes % 2 === 1 ||
      (wides > 1 && wides % 2 === 0) ||
      (noBalls > 1 && noBalls % 2 === 0);

    if (swapEnds) {
      nextState.strikerId = nonStrikerId;
      nextState.nonStrikerId = strikerId;
    }
    if (matchEvent.delivery.wicket) {
      const batterOutId = matchEvent.delivery.wicket.batterOutId;
      const highestbatterID = Math.max(
        nextState.strikerId,
        nextState.nonStrikerId,
      );
      if (highestbatterID === 11) {
        nextState.strikerId = null;
        nextState.nonStrikerId = null;
      } else {
        const batterInId = highestbatterID + 1;
        nextState.strikerId === batterOutId
          ? (nextState.strikerId = batterInId)
          : (nextState.nonStrikerId = batterInId);
      }
    }
  }
  if (matchEvent.type === "endOver") {
    nextState.overNumber++;
    const bowlerId = matchEvent.nextBowlerId;
    nextState.currentBowlerId = bowlerId;

    const strikerId = state.nonStrikerId;
    const nonStrikerId = state.strikerId;
    nextState.strikerId = strikerId;
    nextState.nonStrikerId = nonStrikerId;
  }
  if (matchEvent.type === "penaltyRunsAwarded") {
    nextState.penalties
      ? nextState.penalties.push(matchEvent.runs)
      : (nextState.penalties = [matchEvent.runs]);
  }

  return nextState;
}

// Over
// Dot ball
// const event1: MatchEvent = {
//   type: "deliveryBowled",
//   delivery: { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 0, time: 1 },
// };
// const state1: InningsState = {
//   deliveries: [
//     { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 0, time: 1 },
//   ],
//   batters: { 1: { deliveryIds: [0] } },
//   bowlers: { 1: { deliveryIds: [0] } },
//   current: {
//     overNumber: 1,
//     bowlerId: 1,
//     strikerId: 1,
//     nonStrikerId: 2,
//   },
// };

// // Single
// const event2: MatchEvent = {
//   type: "deliveryBowled",
//   delivery: { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 1, time: 1 },
// };
// const state2: InningsState = {
//   deliveries: [
//     { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 0, time: 1 },
//     { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 1, time: 1 },
//   ],
//   batters: { 1: { deliveryIds: [0, 1] } },
//   bowlers: { 1: { deliveryIds: [0, 1] } },
//   current: {
//     overNumber: 1,
//     bowlerId: 1,
//     strikerId: 2,
//     nonStrikerId: 1,
//   },
// };

// // Wicket
// const event3: MatchEvent = {
//   type: "deliveryBowled",
//   delivery: {
//     overNumber: 1,
//     bowlerId: 1,
//     strikerId: 1,
//     batRuns: 1,
//     time: 1,
//     wicket: { batterOutId: 2, howOut: { kind: "bowled" } },
//   },
// };
// const state3: InningsState = {
//   deliveries: [
//     { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 0, time: 1 },
//     { overNumber: 1, bowlerId: 1, strikerId: 1, batRuns: 1, time: 1 },
//     {
//       overNumber: 1,
//       bowlerId: 1,
//       strikerId: 2,
//       batRuns: 1,
//       time: 1,
//       wicket: { batterOutId: 2, howOut: { kind: "bowled" } },
//     },
//   ],
//   // score: {batterRuns: 1, wickets: 1, extras: {fieldingExtras: 1, bowlingExtras: 0}, grandTotal: 1}
//   batters: { 1: { deliveryIds: [0, 1, 2] } },
//   bowlers: { 1: { deliveryIds: [0, 1] }, 2: { deliveryIds: [2] } },
//   current: {
//     overNumber: 1,
//     bowlerId: 1,
//     strikerId: 3,
//     nonStrikerId: 1,
//   },
// };

// // Extra
// const event4: MatchEvent = {
//   type: "deliveryBowled",
//   delivery: {
//     overNumber: 1,
//     bowlerId: 1,
//     strikerId: 1,
//     batRuns: 1,
//     time: 1,
//     extras: { wides: 1 },
//   },
// };
