import { describe, it, expect } from "vitest";
import {
  applyInput,
  type DeliveryInput,
  type HowOut,
  type InningsState,
} from "@/types/delivery";
import { selectBowlingsAnalysis } from "./selectors";

// Bowler 1 bowling to batters 1 and 2, with batter 3 next in.
const START: InningsState = {
  deliveries: [],
  batters: { 1: { deliveryIds: [] }, 2: { deliveryIds: [] }, 3: { deliveryIds: [] } },
  bowlers: { 1: { deliveryIds: [] } },
  overNumber: 1,
  currentBowlerId: 1,
  strikerId: 1,
  nonStrikerId: 2,
};

// Bowler 1's mark for a single ball on which the striker was out, and their wickets.
const afterWicket = (howOut: HowOut, input: DeliveryInput = {}) => {
  const state = applyInput(START, { ...input, wicket: { batterOutId: 1, howOut } });
  const [row] = selectBowlingsAnalysis(state);
  return { bowlerWicket: row.oversAnalysis[0].deliveryMarks[0].bowlerWicket, wkts: row.wkts };
};

describe("selectBowlingsAnalysis wickets", () => {
  it.each<HowOut>(["bowled", "caught", "lbw", "stumped", "hitWicket"])(
    "%s shows a W and counts to the bowler",
    (howOut) => expect(afterWicket(howOut)).toEqual({ bowlerWicket: true, wkts: 1 }),
  );
  it.each<HowOut>(["runOut", "obstructingTheField", "hitTheBallTwice"])(
    "%s shows no W and doesn't count to the bowler",
    (howOut) => expect(afterWicket(howOut)).toEqual({ bowlerWicket: false, wkts: 0 }),
  );
  it("a stumping off a wide shows a W on the wide", () =>
    expect(afterWicket("stumped", { extras: { wides: 1 } })).toEqual({ bowlerWicket: true, wkts: 1 }));
  it("a run out off a wide shows no W", () =>
    expect(afterWicket("runOut", { extras: { wides: 1 } })).toEqual({ bowlerWicket: false, wkts: 0 }));
  it("a run out after 2 runs shows no W", () =>
    expect(afterWicket("runOut", { batRuns: 2 })).toEqual({ bowlerWicket: false, wkts: 0 }));
});
