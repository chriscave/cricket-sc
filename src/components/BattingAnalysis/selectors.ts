import { toDeliveryMark, type DeliveryMark } from "@/components/DeliveryMarks";
import {
  creditedToBowler,
  isBallFaced,
  oversAt,
  type Delivery,
  type HowOut,
  type InningsState,
} from "@/scoring";

// One column of a batter's runs: up to 3 dot balls stacked, or 2 balls (each in half the
// column) once it has a run or another mark in it.
export type BattingColumn = DeliveryMark[];

// hasBatted: they've come in: they're at the crease, have faced a ball, or are out.
// onStrike: they're the batter on strike now.
// howOut: how the batter was dismissed, or undefined if they're not out.
// bowlerId: the bowler credited with the wicket, if any (not for a run out).
// overIn: the over and ball they came in at (see oversAt): "0.0" for the openers, or
//   undefined if they haven't come in yet.
// overOut: the over and ball they were out on, or undefined if they're not out.
// total: runs off the bat. balls: balls faced (see isBallFaced).
// minutes: minutes batted, from when they came in to the ball they were out on.
//   Undefined if they're not out.
// fours, sixes: boundaries hit.
// timeIn: when they came in. timeOut: the time of the ball they were out on. Each is
//   undefined until it's happened.
// ballsTo50, ballsTo100: balls faced to reach that score, or undefined if they haven't.
// minutesTo50, minutesTo100: minutes from when they came in to the ball that took them
//   there, or undefined if they haven't got there.
export type BatterRow = {
  columns: BattingColumn[];
  hasBatted: boolean;
  onStrike: boolean;
  howOut?: HowOut;
  bowlerId?: number;
  overIn?: string;
  overOut?: string;
  timeIn?: number;
  timeOut?: number;
  total: number;
  balls: number;
  minutes?: number;
  fours: number;
  sixes: number;
  ballsTo50?: number;
  ballsTo100?: number;
  minutesTo50?: number;
  minutesTo100?: number;
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
// The ball that took the batter to `target` runs: the balls they'd faced by then,
// counting it, and when it was entered. Undefined if they haven't got there.
function reach(deliveries: Delivery[], target: number) {
  let runs = 0;
  let balls = 0;
  for (const d of deliveries) {
    if (isBallFaced(d)) balls++;
    runs += d.batRuns;
    if (runs >= target) return { balls, time: d.time };
  }
  return undefined;
}

// Minutes between two times as read off a clock: 14:00 to 14:35 is 35, whatever the seconds.
const clockMinutes = (from: number, to: number) =>
  Math.floor(to / 60_000) - Math.floor(from / 60_000);

export function selectBattingAnalysis(state: InningsState): BatterRow[] {
  const atCrease = [state.strikerId, state.nonStrikerId];
  // Where each wicket fell, as indexes into the deliveries.
  const wicketBalls = state.deliveries.flatMap((d, i) => (d.wicket ? [i] : []));
  const oversAtBall = (i: number | undefined) =>
    i === undefined || i === -1 ? undefined : oversAt(state, i);
  return Object.entries(state.batters).map(([key, b]) => {
    const id = Number(key);
    const deliveries = b.deliveryIds.map((i) => state.deliveries[i]);
    // The ball they were out on. Not always one they faced: a non-striker can be run out.
    const outBall = state.deliveries.findIndex((d) => d.wicket?.batterOutId === id);
    const wicketBall = outBall === -1 ? undefined : state.deliveries[outBall];
    const howOut = wicketBall?.wicket?.howOut;
    const hits = (runs: number) => deliveries.filter((d) => d.batRuns === runs).length;
    const to50 = reach(deliveries, 50);
    const to100 = reach(deliveries, 100);
    const minutesTo = (time?: number) =>
      time === undefined || b.timeIn === undefined ? undefined : clockMinutes(b.timeIn, time);
    return {
      columns: battingColumns(deliveries.map(toDeliveryMark)),
      hasBatted: deliveries.length > 0 || howOut !== undefined || atCrease.includes(id),
      onStrike: state.strikerId === id,
      howOut,
      bowlerId: howOut && creditedToBowler(howOut) ? wicketBall?.bowlerId : undefined,
      // 1 and 2 open; after that, batter n comes in at the (n - 2)th wicket.
      // TODO: a batter retiring also brings in the next batter, so count retirements
      // here too once retiring is supported.
      overIn: id <= 2 ? "0.0" : oversAtBall(wicketBalls[id - 3]),
      overOut: oversAtBall(outBall),
      timeIn: b.timeIn,
      timeOut: wicketBall?.time,
      total: deliveries.reduce((sum, d) => sum + d.batRuns, 0),
      balls: deliveries.filter(isBallFaced).length,
      minutes: minutesTo(wicketBall?.time),
      fours: hits(4),
      sixes: hits(6),
      ballsTo50: to50?.balls,
      ballsTo100: to100?.balls,
      minutesTo50: minutesTo(to50?.time),
      minutesTo100: minutesTo(to100?.time),
    };
  });
}
