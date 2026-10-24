import { describe, it, expect } from "vitest";
import { applyInput, type DeliveryInput, type InningsState } from "@/scoring";
import { selectRunTracker } from "./selectors";

// Bowler 1 bowling to batters 1 and 2.
const START: InningsState = {
  deliveries: [],
  batters: { 1: { deliveryIds: [] }, 2: { deliveryIds: [] } },
  bowlers: { 1: { deliveryIds: [] } },
  overNumber: 1,
  currentBowlerId: 1,
  strikerId: 1,
  nonStrikerId: 2,
};

const DOT: DeliveryInput = {};
const BOWLED: DeliveryInput = { wicket: { batterOutId: 1, howOut: "bowled" } };
const runs = (batRuns: number): DeliveryInput => ({ batRuns });
const tracker = (inputs: DeliveryInput[]) => selectRunTracker(inputs.reduce(applyInput, START));

describe("selectRunTracker", () => {
  it("crosses off each scoring ball as one stroke", () => {
    expect(tracker([runs(4), runs(1), runs(2)]).strokes).toEqual([[1, 4], [5, 5], [6, 7]]);
  });
  it("counts extras the same as runs off the bat", () => {
    expect(tracker([{ extras: { wides: 1 } }, { extras: { byes: 2 } }]).strokes).toEqual([[1, 1], [2, 3]]);
  });
  it("puts dots on the next number to be crossed off", () => {
    expect(tracker([DOT, DOT, runs(2), DOT]).dots).toEqual({ 1: 2, 3: 1 });
  });
  it("counts a wicket with no runs as a dot", () => {
    expect(tracker([BOWLED]).dots).toEqual({ 1: 1 });
  });
});
