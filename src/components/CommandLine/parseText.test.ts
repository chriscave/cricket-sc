import { describe, it, expect } from "vitest";
import type { DeliveryInput } from "@/scoring";
import { parseText } from "./parseText";

const parsesTo = (text: string, input: DeliveryInput) =>
  expect(parseText(text)).toEqual({ ok: true, input, needsHowOut: false });
const fails = (text: string) => expect(parseText(text).ok).toBe(false);

describe("parseText", () => {
  describe("runs off the bat", () => {
    it.each([
      ["0", 0],
      ["1", 1],
      ["4", 4],
      ["6", 6],
    ])("%s", (text, runs) => parsesTo(text, { batRuns: runs }));
    it(". is a dot ball", () => parsesTo(".", { batRuns: 0 }));
  });

  describe("wickets", () => {
    const wicketOn = (text: string, input: DeliveryInput) =>
      expect(parseText(text)).toEqual({ ok: true, input, needsHowOut: true });
    it.each(["w", "W"])("%s is a wicket on a dot ball", (t) => wicketOn(t, { batRuns: 0 }));
    it("2w is a wicket after 2 runs", () => wicketOn("2w", { batRuns: 2 }));
    it.each(["+w", "wdw"])("%s is a wicket off a wide", (t) =>
      wicketOn(t, { extras: { wides: 1 } }));
    it("+.w is a wicket after a wide and a run", () =>
      wicketOn("+.w", { extras: { wides: 2 } }));
    it("nbw is a wicket off a no ball", () => wicketOn("nbw", { extras: { noBalls: 1 } }));
    it("O..w is a wicket after a no ball and 2 runs", () =>
      wicketOn("O..w", { extras: { noBalls: 3 } }));
    it("nb1w is a wicket after a no ball hit for 1", () =>
      wicketOn("nb1w", { batRuns: 1, extras: { noBalls: 1 } }));
    it("2lbw is a wicket after 2 leg byes", () =>
      wicketOn("2lbw", { extras: { legByes: 2 } }));
  });

  describe("byes and leg byes", () => {
    it("b on its own is a single bye", () => parsesTo("b", { extras: { byes: 1 } }));
    it("lb on its own is a single leg bye", () =>
      parsesTo("lb", { extras: { legByes: 1 } }));
    it("2b", () => parsesTo("2b", { extras: { byes: 2 } }));
    it("1lb", () => parsesTo("1lb", { extras: { legByes: 1 } }));
    it("4lb", () => parsesTo("4lb", { extras: { legByes: 4 } }));
  });

  describe("wides", () => {
    it.each(["wd", "+"])("%s is a wide", (text) =>
      parsesTo(text, { extras: { wides: 1 } }));
    it.each(["wd2", "+2", "wd..", "+.."])(
      "%s is a wide with 2 runs taken",
      (text) => parsesTo(text, { extras: { wides: 3 } }),
    );
    it.each(["+4", "+...."])("%s is a wide that went for 4", (text) =>
      parsesTo(text, { extras: { wides: 5 } }));
  });

  describe("no balls", () => {
    it.each(["nb", "o", "O"])("%s is a no ball", (text) =>
      parsesTo(text, { extras: { noBalls: 1 } }));
    it.each(["nb4", "o4", "O4"])("%s is a no ball hit for 4", (text) =>
      parsesTo(text, { batRuns: 4, extras: { noBalls: 1 } }));
    it("nb.... is a no ball with 4 runs not off the bat", () =>
      parsesTo("nb....", { extras: { noBalls: 5 } }));
  });

  describe("errors", () => {
    it.each([
      ["empty input", ""],
      ["negative runs", "-1"],
      ["0 byes", "0b"],
      ["0 leg byes", "0lb"],
      ["unknown letters", "x"],
      ["text after a number", "4q"],
      ["two wickets", "ww"],
      ["0 byes then a wicket", "0bw"],
      ["r on its own", "r"],
    ])("%s", (_, text) => fails(text));
  });
});
