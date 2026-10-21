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
