import { describe, it, expect } from "vitest";
import type { DeliveryInput } from "@/types/delivery";
import { parseText } from "./parseText";

const parsesTo = (text: string, input: DeliveryInput) =>
  expect(parseText(text)).toEqual({ ok: true, input });
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
    it.each(["w", "W"])("%s is a bowled wicket", (text) =>
      expect(parseText(text)).toEqual({
        ok: true,
        input: expect.objectContaining({
          wicket: expect.objectContaining({ howOut: { kind: "bowled" } }),
        }),
      }));
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
    ])("%s", (_, text) => fails(text));
  });
});
