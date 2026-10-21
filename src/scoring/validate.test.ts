import { describe, it, expect } from "vitest";
import { possibleDismissals, validateDeliveryInput } from "./validate";
import type { DeliveryInput } from "./types";
import type { HowOut } from "./dismissals";

const isValid = (input: DeliveryInput) => validateDeliveryInput(input).valid;
const out = (howOut: HowOut) => ({ batterOutId: 1, howOut });

const BOWLED: HowOut = "bowled";
const LBW: HowOut = "lbw";
const CAUGHT: HowOut = "caught";
const STUMPED: HowOut = "stumped";
const HIT_WICKET: HowOut = "hitWicket";
const RUN_OUT: HowOut = "runOut";
const OBSTRUCTING: HowOut = "obstructingTheField";
const HIT_TWICE: HowOut = "hitTheBallTwice";

describe("validateDeliveryInput", () => {
  describe("accepts", () => {
    it("a dot ball", () => expect(isValid({})).toBe(true));
    it("runs off the bat", () => expect(isValid({ batRuns: 4 })).toBe(true));
    it("a wide", () => expect(isValid({ extras: { wides: 1 } })).toBe(true));
    it("wides that were run", () => expect(isValid({ extras: { wides: 3 } })).toBe(true));
    it("a no ball hit for runs", () =>
      expect(isValid({ batRuns: 4, extras: { noBalls: 1 } })).toBe(true));
    it("byes", () => expect(isValid({ extras: { byes: 2 } })).toBe(true));
    it("leg byes", () => expect(isValid({ extras: { legByes: 1 } })).toBe(true));
    it("a bowled wicket", () =>
      expect(isValid({ wicket: out(BOWLED) })).toBe(true));
    it("a catch with the fielder recorded", () =>
      expect(isValid({ wicket: { batterOutId: 1, howOut: CAUGHT, fielder: "Jones" } })).toBe(true));
    it("runs off the bat and then a run out", () =>
      expect(isValid({ batRuns: 1, wicket: out(RUN_OUT) })).toBe(true));
    it.each([
      ["run out", RUN_OUT],
      ["obstructing the field", OBSTRUCTING],
      ["hit the ball twice", HIT_TWICE],
    ])("%s off a no ball", (_, howOut) =>
      expect(isValid({ extras: { noBalls: 1 }, wicket: out(howOut) })).toBe(true));
    it("runs taken before obstructing the field", () =>
      expect(isValid({ batRuns: 1, wicket: out(OBSTRUCTING) })).toBe(true));
    it("a run out after wides were run", () =>
      expect(isValid({ extras: { wides: 2 }, wicket: out(RUN_OUT) })).toBe(true));
    it.each([
      ["stumped", STUMPED],
      ["hit wicket", HIT_WICKET],
      ["run out", RUN_OUT],
      ["obstructing the field", OBSTRUCTING],
    ])("%s off a wide", (_, howOut) =>
      expect(isValid({ extras: { wides: 1 }, wicket: out(howOut) })).toBe(true));
  });

  describe("rejects", () => {
    it("negative runs off the bat", () => expect(isValid({ batRuns: -1 })).toBe(false));
    it("fractional runs", () => expect(isValid({ batRuns: 1.5 })).toBe(false));
    it("negative extras", () => expect(isValid({ extras: { byes: -2 } })).toBe(false));
    it("runs off the bat on a wide", () =>
      expect(isValid({ batRuns: 2, extras: { wides: 1 } })).toBe(false));
    it("a ball that is both a wide and a no ball", () =>
      expect(isValid({ extras: { wides: 1, noBalls: 1 } })).toBe(false));
    it("byes and leg byes on the same ball", () =>
      expect(isValid({ extras: { byes: 1, legByes: 1 } })).toBe(false));
    it("byes together with runs off the bat", () =>
      expect(isValid({ batRuns: 1, extras: { byes: 1 } })).toBe(false));
    it.each([
      ["bowled", BOWLED],
      ["lbw", LBW],
      ["caught", CAUGHT],
      ["stumped", STUMPED],
      ["hit wicket", HIT_WICKET],
    ])("%s off a no ball", (_, howOut) =>
      expect(isValid({ extras: { noBalls: 1 }, wicket: out(howOut) })).toBe(false));
    it.each([
      ["bowled", BOWLED],
      ["lbw", LBW],
      ["caught", CAUGHT],
      ["hit the ball twice", HIT_TWICE],
    ])("%s off a wide", (_, howOut) =>
      expect(isValid({ extras: { wides: 1 }, wicket: out(howOut) })).toBe(false));
    it.each([
      ["runs off the bat when caught", { batRuns: 1, wicket: out(CAUGHT) }],
      ["byes when bowled", { extras: { byes: 1 }, wicket: out(BOWLED) }],
      ["leg byes when hit the ball twice", { extras: { legByes: 1 }, wicket: out(HIT_TWICE) }],
      ["wides run when stumped", { extras: { wides: 2 }, wicket: out(STUMPED) }],
    ])("%s", (_, input: DeliveryInput) => expect(isValid(input)).toBe(false));
    it.each([
      ["byes", { byes: 1 }],
      ["leg byes", { legByes: 1 }],
    ])("%s on a wide", (_, extras) =>
      expect(isValid({ extras: { wides: 1, ...extras } })).toBe(false));
  });

  // it("reports every problem, not just the first", () => {
  //   const result = validateDeliveryInput({ batRuns: -1, extras: { byes: 1, legByes: 1 } });
  //   expect(result.valid).toBe(false);
  //   if (!result.valid) expect(result.errors.length).toBeGreaterThanOrEqual(2);
  // });
});

describe("possibleDismissals", () => {
  it.each<[string, DeliveryInput, HowOut[]]>([
    ["a legal ball", {}, ["bowled", "caught", "lbw", "stumped", "hitWicket", "runOut", "obstructingTheField", "hitTheBallTwice"]],
    ["runs off the bat", { batRuns: 2 }, ["runOut", "obstructingTheField"]],
    ["a wide", { extras: { wides: 1 } }, ["stumped", "hitWicket", "runOut", "obstructingTheField"]],
    ["a no ball", { extras: { noBalls: 1 } }, ["runOut", "obstructingTheField", "hitTheBallTwice"]],
    ["a no ball with runs not off the bat", { extras: { noBalls: 3 } }, ["runOut", "obstructingTheField"]],
    ["byes", { extras: { byes: 1 } }, ["runOut", "obstructingTheField"]],
  ])("%s", (_, input, expected) => expect(possibleDismissals(input)).toEqual(expected));
});
