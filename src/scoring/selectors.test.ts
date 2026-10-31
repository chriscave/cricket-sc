import { describe, it, expect } from "vitest";
import { isInningsOver, wicketsFallen } from "./selectors";
import { NO_EXTRAS, type Delivery, type InningsState } from "./types";

const ball = (wicket: boolean): Delivery => ({
  overNumber: 1,
  bowlerId: 1,
  batRuns: 0,
  extras: NO_EXTRAS,
  wicket: wicket ? { batterOutId: 1, howOut: "bowled" } : undefined,
  time: 0,
});

// An innings of the given balls, with true for each one that took a wicket.
const innings = (...wickets: boolean[]): InningsState => ({
  deliveries: wickets.map(ball),
  batters: {},
  bowlers: {},
  overNumber: 1,
  currentBowlerId: 1,
  strikerId: 1,
  nonStrikerId: 2,
});

const tenWickets = Array<boolean>(10).fill(true);

describe("wicketsFallen", () => {
  it("counts the balls that took a wicket", () =>
    expect(wicketsFallen(innings(false, true, false, true))).toBe(2));
});

describe("isInningsOver", () => {
  it("is false after 9 wickets", () =>
    expect(isInningsOver(innings(...tenWickets.slice(1), false))).toBe(false));
  it("is true once 10 wickets have fallen", () =>
    expect(isInningsOver(innings(...tenWickets))).toBe(true));
});
