import { describe, it, expect } from "vitest";
import type { DeliveryInput } from "@/types/delivery";
import { parseText } from "./parseText";

const parsesTo = (text: string, input: DeliveryInput, needsRunOutBatsman = false) =>
  expect(parseText(text)).toEqual({ ok: true, input, needsHowOut: false, needsRunOutBatsman });
const runOutTo = (text: string, input: DeliveryInput) => parsesTo(text, input, true);
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
    it.each(["w", "W"])("%s is a wicket still needing how out", (text) =>
      expect(parseText(text)).toEqual({
        ok: true,
        input: { batRuns: 0 },
        needsHowOut: true,
        needsRunOutBatsman: false,
      }));
  });

  describe("run outs", () => {
    it.each(["r", "R"])("%s is a run out without a run", (text) =>
      runOutTo(text, { batRuns: 0 }));
    it("2r is a run out after 2 runs", () => runOutTo("2r", { batRuns: 2 }));
    it("nbr is a run out on a no ball", () =>
      runOutTo("nbr", { extras: { noBalls: 1 } }));
    it("nb1r is a no ball, 1 off the bat, then a run out", () =>
      runOutTo("nb1r", { batRuns: 1, extras: { noBalls: 1 } }));
    it("nb.r is a no ball, 1 not off the bat, then a run out", () =>
      runOutTo("nb.r", { extras: { noBalls: 2 } }));
    it("+r is a run out on a wide", () => runOutTo("+r", { extras: { wides: 1 } }));
    it("+.r is a wide, 1 run, then a run out", () =>
      runOutTo("+.r", { extras: { wides: 2 } }));
    it("br is a run out going for a bye", () => runOutTo("br", { extras: { byes: 1 } }));
    it("2br is a run out after 2 byes", () => runOutTo("2br", { extras: { byes: 2 } }));
    it("2lbr is a run out after 2 leg byes", () =>
      runOutTo("2lbr", { extras: { legByes: 2 } }));
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
      ["a wicket and a run out", "wr"],
      ["two run outs", "rr"],
      ["0 byes then a run out", "0br"],
    ])("%s", (_, text) => fails(text));
  });
});
