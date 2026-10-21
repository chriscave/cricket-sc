import { toDeliveryMark, type DeliveryMark } from "@/components/DeliveryMarks";
import type { InningsState } from "@/types/delivery";

// One column of a batter's runs: up to 3 dot balls stacked, or 2 balls (each in half the
// column) once it has a run or another mark in it.
export type BattingColumn = DeliveryMark[];

// out: the batter has been dismissed, so their runs are closed off.
export type BatterRow = { columns: BattingColumn[]; out: boolean };

// A ball drawn as a plain dot (see renderMark).
export const isDot = (m: DeliveryMark) =>
  m.isLegal && !m.extras.byes && !m.extras.legByes && !m.bowlerWicket && m.batRuns === 0;

const fits = (column: BattingColumn, mark: DeliveryMark) =>
  column.length < (isDot(mark) && column.every(isDot) ? 3 : 2);

export function battingColumns(marks: DeliveryMark[]): BattingColumn[] {
  const columns: BattingColumn[] = [];
  for (const mark of marks) {
    const last = columns.at(-1);
    if (last && fits(last, mark)) last.push(mark);
    else columns.push([mark]);
  }
  return columns;
}

// One row per batter, in batting order: every ball bowled while they were on strike.
// Who is out comes from the wicket, not who faced the ball, because a non-striker can be
// run out.
export function selectBattingAnalysis(state: InningsState): BatterRow[] {
  const outIds = new Set(state.deliveries.flatMap((d) => (d.wicket ? [d.wicket.batterOutId] : [])));
  return Object.entries(state.batters).map(([id, b]) => ({
    columns: battingColumns(b.deliveryIds.map((i) => toDeliveryMark(state.deliveries[i]))),
    out: outIds.has(Number(id)),
  }));
}
