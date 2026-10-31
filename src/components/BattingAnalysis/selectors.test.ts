import { describe, it, expect } from "vitest";
import { toDeliveryMark } from "@/components/DeliveryMarks";
import {
  apply,
  applyInput,
  type TypedBall,
  type InningsState,
} from "@/scoring";
import { battingColumns, isDot, selectBattingAnalysis } from "./selectors";

// The marks for a run of balls, as the bowling analysis would draw them.
const marksFor = (inputs: TypedBall[]) =>
  inputs.map((input) =>
    toDeliveryMark({
      overNumber: 1,
      bowlerId: 1,
      batRuns: input.batRuns ?? 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, ...input.extras },
      wicket: input.wicket,
      time: 0,
    }),
  );

const DOT: TypedBall = {};
const BOWLED: TypedBall = { wicket: { batterOutId: 1, howOut: "bowled" } };
const RUN_OUT: TypedBall = { wicket: { batterOutId: 1, howOut: "runOut" } };
const WIDE: TypedBall = { extras: { wides: 1 } };
const runs = (batRuns: number): TypedBall => ({ batRuns });

// Each column as labels: "." for a dot, "+" for a wide, "W" for a bowler's wicket, or the
// runs off the bat.
const columnsOf = (inputs: TypedBall[]) =>
  battingColumns(marksFor(inputs)).map((col) =>
    col.map((m) =>
      m.bowlerWicket ? "W" : m.extras.wides ? "+" : isDot(m) ? "." : String(m.batRuns),
    ),
  );

describe("battingColumns", () => {
  it.each<[string, TypedBall[], string[][]]>([
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

// Records the balls in order, a minute apart from time 0.
const play = (state: InningsState, ...balls: TypedBall[]) =>
  balls.reduce((s, ball, i) => applyInput(s, { ...ball, time: i * 60_000 }), state);

describe("selectBattingAnalysis", () => {
  it("gives each ball to the batter on strike", () => {
    const state = play(START, ...[DOT, { batRuns: 1 }, DOT]);
    expect(selectBattingAnalysis(state)).toMatchObject([
      { columns: [[{ batRuns: 0 }, { batRuns: 1 }]] },
      { columns: [[{ batRuns: 0 }]] },
    ]);
  });
  it("marks the batter who was bowled as out", () => {
    const state = play(START, { wicket: { batterOutId: 1, howOut: "bowled" } });
    expect(selectBattingAnalysis(state)).toMatchObject([{ howOut: "bowled" }, { howOut: undefined }]);
  });
  it("marks a run out non-striker as out, not the batter who faced the ball", () => {
    const state = play(START, { batRuns: 1, wicket: { batterOutId: 2, howOut: "runOut" } });
    expect(selectBattingAnalysis(state)).toMatchObject([{ howOut: undefined }, { howOut: "runOut" }]);
  });

  describe("hasBatted", () => {
    const withNextIn: InningsState = { ...START, batters: { ...START.batters, 3: { deliveryIds: [] } } };
    const hasBatted = (...inputs: TypedBall[]) =>
      selectBattingAnalysis(play(withNextIn, ...inputs)).map((row) => row.hasBatted);

    it("is true for the openers from the start, and false for the next batter", () =>
      expect(hasBatted()).toEqual([true, true, false]));
    it("is true for the new batter after a wicket", () =>
      expect(hasBatted(BOWLED)).toEqual([true, true, true]));
    it("is true for a non-striker run out without facing", () => {
      const state = play(withNextIn, { wicket: { batterOutId: 2, howOut: "runOut" } });
      const [, nonStriker] = selectBattingAnalysis(state);
      expect(nonStriker).toMatchObject({ hasBatted: true, balls: 0 });
    });
  });

  describe("overs in and out", () => {
    // Batters 3 and 4 next in, and bowler 2 to bowl the second over.
    const withMore: InningsState = {
      ...START,
      batters: { ...START.batters, 3: { deliveryIds: [] }, 4: { deliveryIds: [] } },
      bowlers: { 1: { deliveryIds: [] }, 2: { deliveryIds: [] } },
    };
    const overs = (state: InningsState) =>
      selectBattingAnalysis(state).map(({ overIn, overOut }) => ({ overIn, overOut }));

    it("has the openers coming in at 0.0, and not out", () =>
      expect(overs(withMore).slice(0, 2)).toEqual([
        { overIn: "0.0", overOut: undefined },
        { overIn: "0.0", overOut: undefined },
      ]));
    it("records the over and ball a wicket fell on as the out batter's out and the next batter's in", () => {
      const secondOver = apply(withMore, { type: "endOver", nextBowlerId: 2 });
      // Batter 2 is on strike in the second over, after the ends swapped.
      const state = play(secondOver, { wicket: { batterOutId: 2, howOut: "bowled" } });
      expect(overs(state)).toEqual([
        { overIn: "0.0", overOut: undefined },
        { overIn: "0.0", overOut: "1.1" },
        { overIn: "1.1", overOut: undefined },
        { overIn: undefined, overOut: undefined },
      ]);
    });
    it("gives a run out non-striker the over of the run out", () => {
      const secondOver = apply(withMore, { type: "endOver", nextBowlerId: 2 });
      const state = play(secondOver, { batRuns: 1, wicket: { batterOutId: 1, howOut: "runOut" } });
      expect(overs(state)[0]).toEqual({ overIn: "0.0", overOut: "1.1" });
    });
  });

  describe("total", () => {
    // As START, with batter 3 next in.
    const withNextIn: InningsState = { ...START, batters: { ...START.batters, 3: { deliveryIds: [] } } };
    const totals = (...inputs: TypedBall[]) =>
      selectBattingAnalysis(play(withNextIn, ...inputs)).map((row) => row.total);

    it("adds up the runs off the bat, including off a no ball", () =>
      expect(totals(runs(4), runs(2), { batRuns: 1, extras: { noBalls: 1 } })).toEqual([7, 0, 0]));
    it("doesn't count byes, leg byes or wides", () =>
      expect(
        totals({ extras: { byes: 2 } }, { extras: { legByes: 1 } }, { extras: { wides: 3 } }),
      ).toEqual([0, 0, 0]));
  });

  describe("balls faced", () => {
    const withNextIn: InningsState = { ...START, batters: { ...START.batters, 3: { deliveryIds: [] } } };
    const balls = (...inputs: TypedBall[]) =>
      selectBattingAnalysis(play(withNextIn, ...inputs)).map((row) => row.balls);

    it("counts dots, runs, byes and no balls but not wides", () =>
      expect(
        balls(DOT, runs(4), { extras: { byes: 2 } }, { extras: { noBalls: 1 } }, WIDE),
      ).toEqual([4, 0, 0]));
  });

  describe("how out and bowler", () => {
    const withBowler2: InningsState = { ...START, bowlers: { 1: { deliveryIds: [] }, 2: { deliveryIds: [] } } };
    const dismissal = (state: InningsState) =>
      selectBattingAnalysis(state).map(({ howOut, bowlerId }) => ({ howOut, bowlerId }));

    it("records the bowler who bowled the batter", () =>
      expect(dismissal(play(withBowler2, BOWLED))[0]).toEqual({ howOut: "bowled", bowlerId: 1 }));
    it("credits the bowler of the over the wicket fell in", () => {
      const secondOver = apply(withBowler2, { type: "endOver", nextBowlerId: 2 });
      const state = play(secondOver, { wicket: { batterOutId: 2, howOut: "caught" } });
      expect(dismissal(state)[1]).toEqual({ howOut: "caught", bowlerId: 2 });
    });
    it("has no bowler for a run out", () =>
      expect(dismissal(play(withBowler2, RUN_OUT))[0]).toEqual({ howOut: "runOut", bowlerId: undefined }));
    it("has no how out for a batter who isn't out", () =>
      expect(dismissal(START)[0]).toEqual({ howOut: undefined, bowlerId: undefined }));
  });

  describe("balls to 50 and 100", () => {
    const fours = (n: number) => Array<TypedBall>(n).fill(runs(4));
    const milestones = (...inputs: TypedBall[]) => {
      const [row] = selectBattingAnalysis(play(START, ...inputs));
      return { ballsTo50: row.ballsTo50, ballsTo100: row.ballsTo100 };
    };

    it("counts the balls to 50, not counting wides", () =>
      expect(milestones(DOT, WIDE, ...fours(12), runs(2))).toEqual({ ballsTo50: 14, ballsTo100: undefined }));
    it("counts the ball that took them past 50", () =>
      expect(milestones(...fours(12), runs(6))).toEqual({ ballsTo50: 13, ballsTo100: undefined }));
    it("counts the balls to 100", () =>
      expect(milestones(...fours(25))).toEqual({ ballsTo50: 13, ballsTo100: 25 }));
    it("has neither on 49", () =>
      expect(milestones(...fours(12), runs(1))).toEqual({ ballsTo50: undefined, ballsTo100: undefined }));
  });

  describe("4s and 6s", () => {
    const withNextIn: InningsState = { ...START, batters: { ...START.batters, 3: { deliveryIds: [] } } };
    const boundaries = (...inputs: TypedBall[]) =>
      selectBattingAnalysis(play(withNextIn, ...inputs)).map(({ fours, sixes }) => ({ fours, sixes }));

    it("counts 4s and 6s off the bat, including off a no ball", () =>
      expect(
        boundaries(runs(4), runs(6), runs(4), runs(2), { batRuns: 4, extras: { noBalls: 1 } })[0],
      ).toEqual({ fours: 3, sixes: 1 }));
    it("doesn't count 4 byes or 4 leg byes", () =>
      expect(boundaries({ extras: { byes: 4 } }, { extras: { legByes: 4 } })[0]).toEqual({
        fours: 0,
        sixes: 0,
      }));
    it("is 0 for batters still to come in", () =>
      expect(boundaries()[2]).toEqual({ fours: 0, sixes: 0 }));
  });
});
