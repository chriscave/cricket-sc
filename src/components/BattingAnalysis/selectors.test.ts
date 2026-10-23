import { describe, it, expect } from "vitest";
import { toDeliveryMark } from "@/components/DeliveryMarks";
import {
  applyInput,
  type DeliveryInput,
  type InningsState,
} from "@/scoring";
import { battingColumns, isDot, selectBattingAnalysis } from "./selectors";

// The marks for a run of balls, as the bowling analysis would draw them.
const marksFor = (inputs: DeliveryInput[]) =>
  inputs.map((input) =>
    toDeliveryMark({
      overNumber: 1,
      bowlerId: 1,
      batRuns: input.batRuns ?? 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, ...input.extras },
      wicket: input.wicket,
    }),
  );

const DOT: DeliveryInput = {};
const BOWLED: DeliveryInput = { wicket: { batterOutId: 1, howOut: "bowled" } };
const RUN_OUT: DeliveryInput = { wicket: { batterOutId: 1, howOut: "runOut" } };
const WIDE: DeliveryInput = { extras: { wides: 1 } };
const runs = (batRuns: number): DeliveryInput => ({ batRuns });

// Each column as labels: "." for a dot, "+" for a wide, "W" for a bowler's wicket, or the
// runs off the bat.
const columnsOf = (inputs: DeliveryInput[]) =>
  battingColumns(marksFor(inputs)).map((col) =>
    col.map((m) =>
      m.bowlerWicket ? "W" : m.extras.wides ? "+" : isDot(m) ? "." : String(m.batRuns),
    ),
  );

describe("battingColumns", () => {
  it.each<[string, DeliveryInput[], string[][]]>([
    ["dots stack to 3", [DOT, DOT, DOT, DOT], [[".", ".", "."], ["."]]],
    ["two runs share a column", [runs(1), runs(2)], [["1", "2"]]],
    ["a third run starts a new column", [runs(1), runs(2), runs(3)], [["1", "2"], ["3"]]],
    ["a run fits under one dot", [DOT, runs(1)], [[".", "1"]]],
    ["a run after two dots gets its own column", [DOT, DOT, runs(1)], [[".", "."], ["1"]]],
    ["a dot fits under a run", [runs(1), DOT], [["1", "."]]],
    ["only one dot fits under a run", [runs(1), DOT, DOT], [["1", "."], ["."]]],
    ["a wide fits under a dot", [DOT, WIDE, DOT], [[".", "+"], ["."]]],
    ["a bowler's wicket fits under a dot", [DOT, BOWLED], [[".", "W"]]],
    ["a run out on a dot ball stacks as a dot", [DOT, RUN_OUT], [[".", "."]]],
  ])("%s", (_, inputs, expected) => expect(columnsOf(inputs)).toEqual(expected));
});

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

describe("selectBattingAnalysis", () => {
  it("gives each ball to the batter on strike", () => {
    const state = [DOT, { batRuns: 1 }, DOT].reduce(applyInput, START);
    expect(selectBattingAnalysis(state)).toMatchObject([
      { columns: [[{ batRuns: 0 }, { batRuns: 1 }]] },
      { columns: [[{ batRuns: 0 }]] },
    ]);
  });
  it("marks the batter who was bowled as out", () => {
    const state = applyInput(START, { wicket: { batterOutId: 1, howOut: "bowled" } });
    expect(selectBattingAnalysis(state)).toMatchObject([{ out: true }, { out: false }]);
  });
  it("marks a run out non-striker as out, not the batter who faced the ball", () => {
    const state = applyInput(START, { batRuns: 1, wicket: { batterOutId: 2, howOut: "runOut" } });
    expect(selectBattingAnalysis(state)).toMatchObject([{ out: false }, { out: true }]);
  });

  describe("total", () => {
    // As START, with batter 3 next in.
    const withNextIn: InningsState = { ...START, batters: { ...START.batters, 3: { deliveryIds: [] } } };
    const totals = (...inputs: DeliveryInput[]) =>
      selectBattingAnalysis(inputs.reduce(applyInput, withNextIn)).map((row) => row.total);

    it("adds up the runs off the bat, including off a no ball", () =>
      expect(totals(runs(4), runs(2), { batRuns: 1, extras: { noBalls: 1 } })).toEqual([7, 0, undefined]));
    it("doesn't count byes, leg byes or wides", () =>
      expect(
        totals({ extras: { byes: 2 } }, { extras: { legByes: 1 } }, { extras: { wides: 3 } }),
      ).toEqual([0, 0, undefined]));
    it("is 0 for the batters at the crease before they face, and missing for those still to come in", () =>
      expect(totals()).toEqual([0, 0, undefined]));
    it("is 0 for a non-striker run out without facing", () =>
      expect(totals({ wicket: { batterOutId: 2, howOut: "runOut" } })).toEqual([0, 0, 0]));
  });

  describe("balls faced", () => {
    const withNextIn: InningsState = { ...START, batters: { ...START.batters, 3: { deliveryIds: [] } } };
    const balls = (...inputs: DeliveryInput[]) =>
      selectBattingAnalysis(inputs.reduce(applyInput, withNextIn)).map((row) => row.balls);

    it("counts dots, runs, byes and no balls but not wides", () =>
      expect(
        balls(DOT, runs(4), { extras: { byes: 2 } }, { extras: { noBalls: 1 } }, WIDE),
      ).toEqual([4, 0, undefined]));
    it("is 0 for the batters at the crease before they face, and missing for those still to come in", () =>
      expect(balls()).toEqual([0, 0, undefined]));
  });
});
