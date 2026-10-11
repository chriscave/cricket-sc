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
  time: number;
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
  strikerId: number | null;
  nonStrikerId: number | null;
  penalties?: number[];
}

// type ValidationResult = { valid: true } | { valid: false; errors: string[] };

// export function validateDeliveryInput(input: DeliveryInput): ValidationResult {
//   const errors: string[] = []
// }

export function input2Event(
  input: DeliveryInput,
  state: InningsState,
): MatchEvent {
  const delivery: Delivery = {
    overNumber: state.overNumber,
    batRuns: input.batRuns ?? 0,
    extras: input.extras, // undefined if the input had no extras
    wicket: input.wicket, // undefined if the input had no wicket
    time: input.time,
  };
  return { type: "deliveryBowled", delivery };
}

export function applyInput(
  state: InningsState,
  input: DeliveryInput,
): InningsState {
  const matchEvent = input2Event(input, state);
  return apply(state, matchEvent);
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
    const bowlerId = state.currentBowlerId;

    // const bowlerId = matchEvent.delivery.bowlerId;
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
        deliveryIds: [...state.batters[strikerId].deliveryIds, deliveryId],
      },
    };
    nextState.bowlers = {
      ...state.bowlers,
      [bowlerId]: {
        deliveryIds: [...state.bowlers[bowlerId].deliveryIds, deliveryId],
      },
    };

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
      const highestbatterID = Math.max(strikerId, nonStrikerId);
      const nextBatterId = highestbatterID <= 11 ? highestbatterID + 1 : null;
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
  if (matchEvent.type === "penaltyRunsAwarded") {
    nextState.penalties = [...(state.penalties ?? []), matchEvent.runs];
  }

  return nextState;
}
