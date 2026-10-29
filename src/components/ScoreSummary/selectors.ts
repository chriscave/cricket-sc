import type { Extras, InningsState } from "@/scoring";

type ExtraKind = keyof Extras | "penalty";

// tally: the runs from each extra, in the order they happened, written in its row like
//   the runs in the batting analysis. Two byes then four byes is [2, 4].
// extras: each row's tally added up.
// totals: sTotal is the sub-total, runs off the bat (the batters' scores added up).
//   extras is all the extras added up. gTotal is the grand total: the two added together.
export type ScoreSummaryData = {
  tally: Record<ExtraKind, number[]>;
  extras: Record<ExtraKind, number>;
  totals: { sTotal: number; extras: number; gTotal: number };
};

const add = (runs: number[]) => runs.reduce((sum, r) => sum + r, 0);

export function selectScoreSummary(state: InningsState): ScoreSummaryData {
  const runsFrom = (kind: keyof Extras) =>
    state.deliveries.map((d) => d.extras[kind]).filter((runs) => runs > 0);
  const tally = {
    byes: runsFrom("byes"),
    legByes: runsFrom("legByes"),
    wides: runsFrom("wides"),
    noBalls: runsFrom("noBalls"),
    penalty: state.penalties ?? [],
  };
  const extras = {
    byes: add(tally.byes),
    legByes: add(tally.legByes),
    wides: add(tally.wides),
    noBalls: add(tally.noBalls),
    penalty: add(tally.penalty),
  };
  const totalExtras = add(Object.values(extras));
  const sTotal = add(state.deliveries.map((d) => d.batRuns));
  return {
    tally,
    extras,
    totals: { sTotal, extras: totalExtras, gTotal: sTotal + totalExtras },
  };
}
