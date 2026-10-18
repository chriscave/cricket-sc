export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export const NO_EXTRAS: Extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };

export type HowOut =
  | { kind: "bowled" }
  | { kind: "lbw" }
  | { kind: "hitWicket" }
  | { kind: "timedOut" }
  | { kind: "caught"; fielder?: string }
  | { kind: "stumped"; keeper?: string }
  | { kind: "runOut"; fielder?: string };

export interface Wicket {
  batterOutId: number;
  howOut: HowOut;
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

// Dismissals possible off a wide or a no ball. Any other dismissal needs a legal ball.
const OUT_OFF_A_WIDE: HowOut["kind"][] = ["stumped", "hitWicket", "runOut"];
const OUT_OFF_A_NO_BALL: HowOut["kind"][] = ["runOut"];

const HOW_OUT_LABELS: Record<HowOut["kind"], string> = {
  bowled: "bowled",
  lbw: "lbw",
  hitWicket: "hit wicket",
  timedOut: "timed out",
  caught: "caught",
  stumped: "stumped",
  runOut: "run out",
};

const isCount = (n: number) => Number.isInteger(n) && n >= 0;

// Checks a delivery makes sense on its own, and returns every problem found, not just
// the first.
export function validateDeliveryInput(input: DeliveryInput): ValidationResult {
  const errors: string[] = [];
  const batRuns = input.batRuns ?? 0;
  const { wides, noBalls, byes, legByes } = { ...NO_EXTRAS, ...input.extras };
  const howOut = input.wicket?.howOut.kind;

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

  if (howOut && wides && !OUT_OFF_A_WIDE.includes(howOut))
    errors.push(`A batter can't be out ${HOW_OUT_LABELS[howOut]} off a wide.`);
  if (howOut && noBalls && !OUT_OFF_A_NO_BALL.includes(howOut))
    errors.push(
      `A batter can't be out ${HOW_OUT_LABELS[howOut]} off a no ball.`,
    );

  return errors.length ? { valid: false, errors } : { valid: true };
}

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

// Wickets credited to the bowler: everything except run outs and timed out.
export const creditedToBowler = (h: HowOut) =>
  h.kind !== "runOut" && h.kind !== "timedOut";

// Whether the most recent ball took a wicket credited to the bowler.
export const hasBowlerWicketFallen = (state: InningsState) => {
  const wicket = state.deliveries.at(-1)?.wicket;
  return wicket !== undefined && creditedToBowler(wicket.howOut);
};

export const batsmanOnStrike = (state: InningsState) => state.strikerId

export const batsmanOffStrike = (state: InningsState) => state.nonStrikerId


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
  state.deliveries.findLast((d) => d.overNumber === state.overNumber - 1)?.bowlerId;

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
