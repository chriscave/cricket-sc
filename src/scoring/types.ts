import type { HowOut } from "./dismissals";

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export const NO_EXTRAS: Extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };

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
  time: number; // when the scorer entered the ball, in ms since 1970 (Date.now())
}

// A ball as the scorer typed it: anything left out is 0. input2Events fills in the rest.
export interface TypedBall {
  batRuns?: number;
  extras?: Partial<Extras>;
  wicket?: Wicket;
}

// A typed ball with the time the scorer entered it, ready to record.
export interface DeliveryInput extends TypedBall {
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
  | { type: "penaltyRunsAwarded"; runs: number }
  | { type: "batterCameIn"; batterId: number; time: number };
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
  // timeIn: when they came in (see batterCameIn), or undefined if they haven't yet.
  batters: Record<number, { deliveryIds: number[]; timeIn?: number }>;
  bowlers: Record<number, { deliveryIds: number[] }>;
  overNumber: number;
  currentBowlerId: number;
  strikerId: number | null;
  nonStrikerId: number | null;
  penalties?: number[];
}
