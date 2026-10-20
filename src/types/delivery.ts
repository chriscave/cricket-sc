export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export const NO_EXTRAS: Extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };

interface DismissalRules {
  label: string;
  creditedToBowler: boolean;
  // Whether runs completed before the wicket still count.
  runsCount: boolean;
  offWide: boolean;
  offNoBall: boolean;
  // Caught, stumped (the keeper) and run out record who took the wicket.
  needsFielder: boolean;
  // Only run out and obstructing the field can dismiss the non-striker.
  nonStrikerCanBeOut: boolean;
}

// prettier-ignore
export const DISMISSALS = {
  bowled:              { label: "bowled",                creditedToBowler: true,  runsCount: false, offWide: false, offNoBall: false, needsFielder: false, nonStrikerCanBeOut: false },
  caught:              { label: "caught",                creditedToBowler: true,  runsCount: false, offWide: false, offNoBall: false, needsFielder: true,  nonStrikerCanBeOut: false },
  lbw:                 { label: "LBW",                   creditedToBowler: true,  runsCount: false, offWide: false, offNoBall: false, needsFielder: false, nonStrikerCanBeOut: false },
  stumped:             { label: "stumped",               creditedToBowler: true,  runsCount: false, offWide: true,  offNoBall: false, needsFielder: true,  nonStrikerCanBeOut: false },
  hitWicket:           { label: "hit wicket",            creditedToBowler: true,  runsCount: false, offWide: true,  offNoBall: false, needsFielder: false, nonStrikerCanBeOut: false },
  runOut:              { label: "run out",               creditedToBowler: false, runsCount: true,  offWide: true,  offNoBall: true,  needsFielder: true,  nonStrikerCanBeOut: true  },
  obstructingTheField: { label: "obstructing the field", creditedToBowler: false, runsCount: true,  offWide: true,  offNoBall: true,  needsFielder: false, nonStrikerCanBeOut: true  },
  hitTheBallTwice:     { label: "hit the ball twice",    creditedToBowler: false, runsCount: false, offWide: false, offNoBall: true,  needsFielder: false, nonStrikerCanBeOut: false },
} as const satisfies Record<string, DismissalRules>;

export type HowOut = keyof typeof DISMISSALS;

export interface Wicket {
  batterOutId: number;
  howOut: HowOut;
  fielder?: string;
}

export interface Delivery {
  overNumber: number;
  bowlerId: number;
  batRuns: number;
  extras: Extras;
  wicket?: Wicket;
  // time: number
}

// What the scorer entered: anything left out is 0. input2Event fills in the rest.
export interface DeliveryInput {
  batRuns?: number;
  extras?: Partial<Extras>;
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
  strikerId: number | null;
  nonStrikerId: number | null;
  penalties?: number[];
}

type ValidationResult = { valid: true } | { valid: false; errors: string[] };

const isCount = (n: number) => Number.isInteger(n) && n >= 0;

// Checks a delivery makes sense on its own, and returns every problem found, not just
// the first.
export function validateDeliveryInput(input: DeliveryInput): ValidationResult {
  const errors: string[] = [];
  const batRuns = input.batRuns ?? 0;
  const { wides, noBalls, byes, legByes } = { ...NO_EXTRAS, ...input.extras };
  const howOut = input.wicket?.howOut;

  const counts: [string, number][] = [
    ["Runs off the bat", batRuns],
    ["Wides", wides],
    ["No balls", noBalls],
    ["Byes", byes],
    ["Leg byes", legByes],
  ];
  for (const [label, n] of counts) {
    if (!isCount(n)) errors.push(`${label} must be a whole number, 0 or more.`);
  }

  if (wides && batRuns) errors.push("A wide can't have runs off the bat.");
  if (wides && noBalls)
    errors.push("A ball can't be both a wide and a no ball.");
  if (wides && (byes || legByes))
    errors.push("Runs taken off a wide count as wides");
  if (byes && legByes) errors.push("A ball can't have both byes and leg byes.");
  if ((byes || legByes) && batRuns)
    errors.push("Byes and leg byes can't have runs off the bat as well.");

  if (howOut) {
    const rules = DISMISSALS[howOut];
    if (wides && !rules.offWide)
      errors.push(`A batter can't be out ${rules.label} off a wide.`);
    if (noBalls && !rules.offNoBall)
      errors.push(`A batter can't be out ${rules.label} off a no ball.`);
    if (!rules.runsCount && (batRuns || byes || legByes || wides > 1 || noBalls > 1))
      errors.push(`No runs can be scored when a batter is out ${rules.label}.`);
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

// The ways a batter could have been out on this ball, in the order of DISMISSALS.
export const possibleDismissals = (input: DeliveryInput): HowOut[] =>
  (Object.keys(DISMISSALS) as HowOut[]).filter(
    (howOut) =>
      validateDeliveryInput({ ...input, wicket: { batterOutId: 0, howOut } }).valid,
  );

export function input2Event(
  input: DeliveryInput,
  state: InningsState,
): MatchEvent {
  const delivery: Delivery = {
    overNumber: state.overNumber,
    bowlerId: state.currentBowlerId,
    batRuns: input.batRuns ?? 0,
    extras: { ...NO_EXTRAS, ...input.extras },
    wicket: input.wicket, // undefined if the input had no wicket
  };
  return { type: "deliveryBowled", delivery };
}

export const isLegal = (d: Delivery) =>
  d.extras.wides === 0 && d.extras.noBalls === 0;

// The deliveries bowled so far in the over currently in progress.
export const currentOverDeliveries = (state: InningsState) =>
  state.deliveries.filter((d) => d.overNumber === state.overNumber);

// Whether an over has had at least 6 legal balls. Overs can run short or long when
// the umpire miscounts, so this doesn't mean the over has ended.
export const hasSixLegalDeliveries = (over: Delivery[]) =>
  over.filter(isLegal).length >= 6;

// Wickets credited to the bowler.
export const creditedToBowler = (h: HowOut) => DISMISSALS[h].creditedToBowler;

// Whether the most recent ball took a wicket credited to the bowler.
export const hasBowlerWicketFallen = (state: InningsState) => {
  const wicket = state.deliveries.at(-1)?.wicket;
  return wicket !== undefined && creditedToBowler(wicket.howOut);
};

export const batsmanOnStrike = (state: InningsState) => state.strikerId;

export const batsmanOffStrike = (state: InningsState) => state.nonStrikerId;

// Records a ball. It never ends the over: that happens when the scorer chooses the
// next bowler.
export function applyInput(
  state: InningsState,
  input: DeliveryInput,
): InningsState {
  return apply(state, input2Event(input, state));
}

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
