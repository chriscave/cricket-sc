import { DISMISSALS, type HowOut } from "./dismissals";
import { NO_EXTRAS, type TypedBall } from "./types";

type ValidationResult = { valid: true } | { valid: false; errors: string[] };

const isCount = (n: number) => Number.isInteger(n) && n >= 0;

// Checks a delivery makes sense on its own, and returns every problem found, not just
// the first.
export function validateDeliveryInput(input: TypedBall): ValidationResult {
  const errors: string[] = [];
  const batRuns = input.batRuns ?? 0;
  const { wides, noBalls, byes, legByes } = { ...NO_EXTRAS, ...input.extras };
  const howOut = input.wicket?.howOut;

  const counts: [string, number][] = [
    ["Runs off the bat", batRuns],
    ["Wides", wides],
    ["No balls", noBalls],
    ["Byes", byes],
    ["Leg byes", legByes],
  ];
  for (const [label, n] of counts) {
    if (!isCount(n)) errors.push(`${label} must be a whole number, 0 or more.`);
  }

  if (wides && batRuns) errors.push("A wide can't have runs off the bat.");
  if (wides && noBalls)
    errors.push("A ball can't be both a wide and a no ball.");
  if (wides && (byes || legByes))
    errors.push("Runs taken off a wide count as wides");
  if (byes && legByes) errors.push("A ball can't have both byes and leg byes.");
  if ((byes || legByes) && batRuns)
    errors.push("Byes and leg byes can't have runs off the bat as well.");

  if (howOut) {
    const rules = DISMISSALS[howOut];
    if (wides && !rules.offWide)
      errors.push(`A batter can't be out ${rules.label} off a wide.`);
    if (noBalls && !rules.offNoBall)
      errors.push(`A batter can't be out ${rules.label} off a no ball.`);
    if (!rules.runsCount && (batRuns || byes || legByes || wides > 1 || noBalls > 1))
      errors.push(`No runs can be scored when a batter is out ${rules.label}.`);
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

// The ways a batter could have been out on this ball, in the order of DISMISSALS.
export const possibleDismissals = (input: TypedBall): HowOut[] =>
  (Object.keys(DISMISSALS) as HowOut[]).filter(
    (howOut) =>
      validateDeliveryInput({ ...input, wicket: { batterOutId: 0, howOut } }).valid,
  );
