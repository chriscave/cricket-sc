import { describe, it, expect } from "vitest";
import { apply, applyInput, input2Event } from "./apply";
import type { DeliveryInput, InningsState } from "./types";

const players = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { deliveryIds: [] }]));

// Over 1: bowler 1 bowling to batters 1 (on strike) and 2, out of 11.
const START: InningsState = {
  deliveries: [],
  batters: players(11),
  bowlers: players(2),
  overNumber: 1,
  currentBowlerId: 1,
  strikerId: 1,
  nonStrikerId: 2,
};

const after = (...inputs: DeliveryInput[]) => inputs.reduce(applyInput, START);
// [on strike, off strike]
const ends = (s: InningsState) => [s.strikerId, s.nonStrikerId];
const bowled = (batterOutId: number): DeliveryInput => ({ wicket: { batterOutId, howOut: "bowled" } });

describe("input2Event", () => {
  it("fills in the over, the bowler and any extras left out", () =>
    expect(input2Event({ batRuns: 2 }, { ...START, overNumber: 3, currentBowlerId: 2 })).toEqual({
      type: "deliveryBowled",
      delivery: {
        overNumber: 3,
        bowlerId: 2,
        batRuns: 2,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
        wicket: undefined,
      },
    }));
});

describe("applyInput", () => {
  it("records the ball against the striker and the bowler", () => {
    const state = after({ batRuns: 4 });
    expect(state.deliveries).toHaveLength(1);
    expect(state.batters[1].deliveryIds).toEqual([0]);
    expect(state.batters[2].deliveryIds).toEqual([]);
    expect(state.bowlers[1].deliveryIds).toEqual([0]);
  });
  it("leaves the state it was given unchanged", () => {
    const before = structuredClone(START);
    applyInput(START, { batRuns: 1 });
    expect(START).toEqual(before);
  });

  describe("strike", () => {
    it.each<[string, DeliveryInput, (number | null)[]]>([
      ["a dot ball keeps strike", {}, [1, 2]],
      ["1 run swaps ends", { batRuns: 1 }, [2, 1]],
      ["2 runs keeps strike", { batRuns: 2 }, [1, 2]],
      ["3 runs swaps ends", { batRuns: 3 }, [2, 1]],
      ["a 4 keeps strike", { batRuns: 4 }, [1, 2]],
      ["1 bye swaps ends", { extras: { byes: 1 } }, [2, 1]],
      ["4 byes keeps strike", { extras: { byes: 4 } }, [1, 2]],
      ["1 leg bye swaps ends", { extras: { legByes: 1 } }, [2, 1]],
      ["a wide keeps strike", { extras: { wides: 1 } }, [1, 2]],
      ["a wide and a run swaps ends", { extras: { wides: 2 } }, [2, 1]],
      ["a no ball keeps strike", { extras: { noBalls: 1 } }, [1, 2]],
      ["a no ball and a run not off the bat swaps ends", { extras: { noBalls: 2 } }, [2, 1]],
      ["a no ball hit for 1 swaps ends", { batRuns: 1, extras: { noBalls: 1 } }, [2, 1]],
    ])("%s", (_, input, expected) => expect(ends(after(input))).toEqual(expected));
  });

  describe("wickets", () => {
    it("the next batter replaces the striker", () =>
      expect(ends(after(bowled(1)))).toEqual([3, 2]));
    it("the next batter replaces a run out non-striker", () =>
      expect(ends(after({ wicket: { batterOutId: 2, howOut: "runOut" } }))).toEqual([1, 3]));
    it("after a run, the next batter takes the end the out batter had reached", () =>
      expect(ends(after({ batRuns: 1, wicket: { batterOutId: 1, howOut: "runOut" } }))).toEqual([2, 3]));
    it("batters come in in order", () =>
      expect(ends(after(bowled(1), bowled(3)))).toEqual([4, 2]));
    it("nobody comes in after the 10th wicket", () => {
      const lastPair = { ...START, strikerId: 10, nonStrikerId: 11 };
      expect(ends(applyInput(lastPair, bowled(10)))).toEqual([null, 11]);
    });
    it("no more balls can be bowled once the innings is over", () =>
      expect(() => applyInput({ ...START, strikerId: null }, {})).toThrow("innings is over"));
  });
});

describe("apply", () => {
  it("endOver starts the next over with the new bowler, and the batters swap ends", () => {
    const state = apply(START, { type: "endOver", nextBowlerId: 2 });
    expect(state).toMatchObject({ overNumber: 2, currentBowlerId: 2 });
    expect(ends(state)).toEqual([2, 1]);
  });
  it("balls after endOver go to the new over and bowler", () => {
    const state = applyInput(apply(START, { type: "endOver", nextBowlerId: 2 }), {});
    expect(state.deliveries[0]).toMatchObject({ overNumber: 2, bowlerId: 2 });
    expect(state.bowlers[2].deliveryIds).toEqual([0]);
  });
  it("penaltyRunsAwarded adds to the penalties", () => {
    const state = [5, 5].reduce(
      (s, runs) => apply(s, { type: "penaltyRunsAwarded", runs }),
      START,
    );
    expect(state.penalties).toEqual([5, 5]);
  });
});
