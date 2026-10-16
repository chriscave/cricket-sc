import type { DeliveryInput } from "@/types/delivery";

export type ParseResult =
  | { ok: true; input: DeliveryInput }
  | { ok: false; error: string };

// non-negative numbers positive numbers
// . as a dot
// w and W as wicket (for now record the wicket as a bowled, we will fix this later.)
// For run outs we will fix this later (for now just ignore them)
// positive numbers followed by b or lb for byes and leg byes (should throw a parsing error for 0b or 0lb)
// wd or + for wide. wd followed by number for those many runs off the wide. Should also be able to use dots so +.. and +2 are the same
// nb or o or O for no ball. nb4 should mean number and batsman hit 4 runs. nb.... should mean 5 no balls.

const RUNS = /^\d+$/; //                   "4"
const BYES = /^(\d*)(b|lb)$/; //           "2b", "lb"
const WIDE = /^(?:wd|\+)(\d+|\.*)$/; //    "wd", "+2", "wd.."
const NO_BALL = /^(?:nb|o|O)(\d+|\.*)$/; // "nb", "o4", "nb...."

const ok = (input: DeliveryInput): ParseResult => ({ ok: true, input });
const fail = (error: string): ParseResult => ({ ok: false, error });

// Runs taken after a wide: none (""), a number ("2"), or one dot per run ("..").
const runsTaken = (suffix: string) =>
  RUNS.test(suffix) ? Number(suffix) : suffix.length;

export function parseText(text: string): ParseResult {
  const t = text.trim();
  if (t === "") return fail("Type a ball, e.g. 4, ., wd2, nb4 or 2b.");
  if (t === ".") return ok({ batRuns: 0 });
  if (RUNS.test(t)) return ok({ batRuns: Number(t) });

  const byes = t.match(BYES);
  if (byes) {
    const [, number, kind] = byes;
    const runs = number === "" ? 1 : Number(number);
    if (runs === 0) return fail(`0${kind} isn't a ball. Use . for a dot ball.`);
    return ok({ extras: kind === "b" ? { byes: runs } : { legByes: runs } });
  }

  const wide = t.match(WIDE);
  if (wide) return ok({ extras: { wides: 1 + runsTaken(wide[1]) } });

  // After a no ball a number is runs off the bat, but dots are runs not off the bat.
  const noBall = t.match(NO_BALL);
  if (noBall) {
    const suffix = noBall[1];
    return RUNS.test(suffix)
      ? ok({ batRuns: Number(suffix), extras: { noBalls: 1 } })
      : ok({ extras: { noBalls: 1 + suffix.length } });
  }

  if (t === "w" || t === "W") return fail("Wickets can't be entered yet.");
  return fail(`Couldn't read "${t}". Try e.g. 4, ., wd2, nb4 or 2b.`);
}
