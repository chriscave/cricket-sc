import { describe, it, expect } from "vitest";
import {
  validateDeliveryInput,
  type DeliveryInput,
  type HowOut,
} from "./delivery";

const isValid = (input: DeliveryInput) => validateDeliveryInput(input).valid;
const out = (howOut: HowOut) => ({ batterOutId: 1, howOut });

const BOWLED: HowOut = { kind: "bowled" };
const LBW: HowOut = { kind: "lbw" };
const CAUGHT: HowOut = { kind: "caught", fielder: "Jones" };
const STUMPED: HowOut = { kind: "stumped", keeper: "Smith" };
const HIT_WICKET: HowOut = { kind: "hitWicket" };
const RUN_OUT: HowOut = { kind: "runOut" };

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
      expect(isValid({ wicket: { batterOutId: 1, howOut: { kind: "bowled" } } })).toBe(true));
    it("runs off the bat and then a run out", () =>
      expect(isValid({ batRuns: 1, wicket: out(RUN_OUT) })).toBe(true));
    it("a run out off a no ball", () =>
      expect(isValid({ extras: { noBalls: 1 }, wicket: out(RUN_OUT) })).toBe(true));
    it.each([
      ["stumped", STUMPED],
      ["hit wicket", HIT_WICKET],
      ["run out", RUN_OUT],
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
    ])("%s off a wide", (_, howOut) =>
      expect(isValid({ extras: { wides: 1 }, wicket: out(howOut) })).toBe(false));
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
