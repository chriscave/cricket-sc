import {
  NO_EXTRAS,
  type Delivery,
  type DeliveryInput,
  type InningsState,
  type MatchEvent,
} from "./types";

// The events a ball makes. A batter at the crease who hasn't come in yet comes in first,
// at the ball's time: both openers on the first ball, and a new batter on the first ball
// after the wicket that brought them in.
export function input2Events(
  input: DeliveryInput,
  state: InningsState,
): MatchEvent[] {
  const comingIn = [state.strikerId, state.nonStrikerId].filter(
    (id): id is number => id !== null && state.batters[id].timeIn === undefined,
  );
  const delivery: Delivery = {
    overNumber: state.overNumber,
    bowlerId: state.currentBowlerId,
    batRuns: input.batRuns ?? 0,
    extras: { ...NO_EXTRAS, ...input.extras },
    wicket: input.wicket, // undefined if the input had no wicket
    time: input.time,
  };
  return [
    ...comingIn.map((batterId): MatchEvent => ({ type: "batterCameIn", batterId, time: input.time })),
    { type: "deliveryBowled", delivery },
  ];
}

// Records a ball. It never ends the over: that happens when the scorer chooses the
// next bowler.
export function applyInput(
  state: InningsState,
  input: DeliveryInput,
): InningsState {
  return input2Events(input, state).reduce(apply, state);
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
    const deliveryId = state.deliveries.length;
    nextState.deliveries = [...state.deliveries, matchEvent.delivery];
    const bowlerId = matchEvent.delivery.bowlerId;
    const strikerId = state.strikerId;
    const nonStrikerId = state.nonStrikerId;
    if (strikerId === null || nonStrikerId === null) {
      throw new Error("innings is over: no batters at the crease");
    }
    // const strikerId = matchEvent.delivery.strikerId;
    // const nonStrikerId = matchEvent.delivery.nonStrikerId;
    nextState.batters = {
      ...state.batters,
      [strikerId]: {
        ...state.batters[strikerId], // keeps timeIn
        deliveryIds: [...state.batters[strikerId].deliveryIds, deliveryId],
      },
    };
    nextState.bowlers = {
      ...state.bowlers,
      [bowlerId]: {
        deliveryIds: [...state.bowlers[bowlerId].deliveryIds, deliveryId],
      },
    };

    const { byes, legByes, wides, noBalls } = matchEvent.delivery.extras;

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
      const highestbatterID = Math.max(strikerId, nonStrikerId);
      const nextBatterId = highestbatterID < 11 ? highestbatterID + 1 : null;
      nextState.strikerId === batterOutId
        ? (nextState.strikerId = nextBatterId)
        : (nextState.nonStrikerId = nextBatterId);
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
  if (matchEvent.type === "batterCameIn") {
    const { batterId, time } = matchEvent;
    nextState.batters = {
      ...state.batters,
      [batterId]: { ...state.batters[batterId], timeIn: time },
    };
  }
  if (matchEvent.type === "penaltyRunsAwarded") {
    nextState.penalties = [...(state.penalties ?? []), matchEvent.runs];
  }

  return nextState;
}
