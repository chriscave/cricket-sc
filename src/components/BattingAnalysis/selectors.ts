import { toDeliveryMark, type DeliveryMark } from "@/components/DeliveryMarks";
import { creditedToBowler, type Delivery, type HowOut, type InningsState } from "@/scoring";

// One column of a batter's runs: up to 3 dot balls stacked, or 2 balls (each in half the
// column) once it has a run or another mark in it.
export type BattingColumn = DeliveryMark[];

// hasBatted: they've come in: they're at the crease, have faced a ball, or are out.
// howOut: how the batter was dismissed, or undefined if they're not out.
// bowlerId: the bowler credited with the wicket, if any (not for a run out).
// overIn: the over they came in, or undefined if they haven't yet.
// overOut: the over they were out in, or undefined if they're not out.
// total: runs off the bat. balls: balls faced (everything but wides).
// fours, sixes: boundaries hit.
// ballsTo50, ballsTo100: balls faced to reach that score, or undefined if they haven't.
export type BatterRow = {
  columns: BattingColumn[];
  hasBatted: boolean;
  howOut?: HowOut;
  bowlerId?: number;
  overIn?: number;
  overOut?: number;
  total: number;
  balls: number;
  fours: number;
  sixes: number;
  ballsTo50?: number;
  ballsTo100?: number;
};

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
// Balls faced (not counting wides) up to and including the one that took the batter to
// `target` runs, or undefined if they haven't got there.
function ballsToReach(deliveries: Delivery[], target: number): number | undefined {
  let runs = 0;
  let balls = 0;
  for (const d of deliveries) {
    if (d.extras.wides === 0) balls++;
    runs += d.batRuns;
    if (runs >= target) return balls;
  }
  return undefined;
}

export function selectBattingAnalysis(state: InningsState): BatterRow[] {
  const atCrease = [state.strikerId, state.nonStrikerId];
  const wicketBalls = state.deliveries.filter((d) => d.wicket);
  return Object.entries(state.batters).map(([key, b]) => {
    const id = Number(key);
    const deliveries = b.deliveryIds.map((i) => state.deliveries[i]);
    // The ball they were out on. Not always one they faced: a non-striker can be run out.
    const wicketBall = state.deliveries.find((d) => d.wicket?.batterOutId === id);
    const howOut = wicketBall?.wicket?.howOut;
    const hits = (runs: number) => deliveries.filter((d) => d.batRuns === runs).length;
    return {
      columns: battingColumns(deliveries.map(toDeliveryMark)),
      hasBatted: deliveries.length > 0 || howOut !== undefined || atCrease.includes(id),
      howOut,
      bowlerId: howOut && creditedToBowler(howOut) ? wicketBall?.bowlerId : undefined,
      // 1 and 2 open; after that, batter n comes in at the (n - 2)th wicket.
      // TODO: a batter retiring also brings in the next batter, so count retirements
      // here too once retiring is supported.
      overIn: id <= 2 ? 1 : wicketBalls[id - 3]?.overNumber,
      overOut: wicketBall?.overNumber,
      total: deliveries.reduce((sum, d) => sum + d.batRuns, 0),
      balls: deliveries.filter((d) => d.extras.wides === 0).length,
      fours: hits(4),
      sixes: hits(6),
      ballsTo50: ballsToReach(deliveries, 50),
      ballsTo100: ballsToReach(deliveries, 100),
    };
  });
}
