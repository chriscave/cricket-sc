import { oversBowled, wicketsFallen, type Extras, type InningsState } from "@/scoring";

type ExtraKind = keyof Extras | "penalty";
// One extra as written in its row: its runs, and who bowled it (none for penalty runs).
export type TallyMark = { runs: number; bowlerId?: number };

// tally: each extra, in the order they happened, written in its row like the runs in the
//   batting analysis. Two byes then four byes is runs 2 then runs 4.
// extras: each row's tally added up.
// totals: sTotal is the sub-total, runs off the bat (the batters' scores added up).
//   extras is all the extras added up. gTotal is the grand total: the two added together.
// footer: the wickets fallen and overs bowled, for "FOR __ WICKETS IN __ OVERS". minutes
//   is left out until times are recorded.
export type ScoreSummaryData = {
  tally: Record<ExtraKind, TallyMark[]>;
  extras: Record<ExtraKind, number>;
  totals: { sTotal: number; extras: number; gTotal: number };
  footer: { wickets: number; overs: string; minutes?: number };
};

const add = (runs: number[]) => runs.reduce((sum, r) => sum + r, 0);
const addMarks = (marks: TallyMark[]) => add(marks.map((m) => m.runs));

export function selectScoreSummary(state: InningsState): ScoreSummaryData {
  const runsFrom = (kind: keyof Extras): TallyMark[] =>
    state.deliveries
      .filter((d) => d.extras[kind] > 0)
      .map((d) => ({ runs: d.extras[kind], bowlerId: d.bowlerId }));
  const tally = {
    byes: runsFrom("byes"),
    legByes: runsFrom("legByes"),
    wides: runsFrom("wides"),
    noBalls: runsFrom("noBalls"),
    penalty: (state.penalties ?? []).map((runs) => ({ runs })),
  };
  const extras = {
    byes: addMarks(tally.byes),
    legByes: addMarks(tally.legByes),
    wides: addMarks(tally.wides),
    noBalls: addMarks(tally.noBalls),
    penalty: addMarks(tally.penalty),
  };
  const totalExtras = add(Object.values(extras));
  const sTotal = add(state.deliveries.map((d) => d.batRuns));
  return {
    tally,
    extras,
    totals: { sTotal, extras: totalExtras, gTotal: sTotal + totalExtras },
    footer: { wickets: wicketsFallen(state), overs: oversBowled(state) },
  };
}
