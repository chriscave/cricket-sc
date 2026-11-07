import {
  creditedToBowler,
  otherEndBowlerId,
  type Delivery,
  type InningsState,
} from "@/scoring";
import { toDeliveryMark, type DeliveryMark } from "@/components/DeliveryMarks";

export type Over = {
  deliveryMarks: DeliveryMark[];
  cumRuns: number;
  cumWickets: number;
  complete: boolean;
  maiden: boolean;
  // endsSpell: the last over of a spell. Someone else has the next over from this end
  // (two overs on), including when that over has only just started.
  endsSpell: boolean;
};

export type BowlerRow = {
  // hasComeOn: they've bowled a ball, or they're bowling the over in progress.
  hasComeOn: boolean;
  // atAnEnd: they're bowling the over in progress, or bowled the last one (the other end).
  atAnEnd: boolean;
  action?: string;
  oversAnalysis: Over[];
  wds: number;
  nb: number;
  completedOvers: number;
  deliveriesInCurrentOver: number;
  // overs: string;
  mdns: number;
  runs: number;
  wkts: number;
  avrge?: number;
  // econ: runs per over, from completed overs only (the over in progress isn't counted).
  // Undefined until they've completed an over.
  econ?: number;
};

export function selectBowlingsAnalysis(state: InningsState): BowlerRow[] {
  const bowlers: BowlerRow[] = [];
  const otherEnd = otherEndBowlerId(state);
  // Who bowled (or is bowling) each match over. The over in progress may not have a ball
  // yet, so its bowler comes from the state.
  const bowlerOfOver = new Map<number, number>(
    state.deliveries.map((d) => [d.overNumber, d.bowlerId]),
  );
  bowlerOfOver.set(state.overNumber, state.currentBowlerId);
  for (const [id, deliveries] of Object.entries(state.bowlers)) {
    const bowlerDeliveries = deliveries.deliveryIds.map(
      (id) => state.deliveries[id],
    );
    const overDeliveries: Delivery[][] = [];
    for (const d of bowlerDeliveries) {
      const current = overDeliveries.at(-1);
      if (current && current[0].overNumber === d.overNumber) {
        current.push(d);
      } else {
        overDeliveries.push([d]);
      }
    }

    const overs: Over[] = [];

    for (const overBalls of overDeliveries) {
      const deliveryMarks = overBalls.map((d) => toDeliveryMark(d));
      const previousOver = overs.at(-1);
      const bowlerOverRuns = overBalls
        .map(
          (d) => d.batRuns + d.extras.noBalls + d.extras.wides,
        )
        .reduce((prev, curr) => prev + curr, 0);
      const bowlerWickets = overBalls.filter(
        (d) => d.wicket && creditedToBowler(d.wicket.howOut),
      ).length;

      const complete = overBalls[0].overNumber < state.overNumber;
      const nextFromThisEnd = bowlerOfOver.get(overBalls[0].overNumber + 2);
      const over: Over = {
        deliveryMarks,
        cumRuns: (previousOver?.cumRuns ?? 0) + bowlerOverRuns,
        cumWickets: (previousOver?.cumWickets ?? 0) + bowlerWickets,
        complete,
        maiden:
          complete &&
          deliveryMarks.every(
            (dm) =>
              dm.batRuns + dm.extras.wides + dm.extras.noBalls === 0,
          ),
        endsSpell: nextFromThisEnd !== undefined && nextFromThisEnd !== Number(id),
      };
      overs.push(over);
    }

    const last = overs.at(-1);
    const runs = last?.cumRuns ?? 0;
    const wkts = last?.cumWickets ?? 0;
    const avrge = wkts > 0 ? runs / wkts : undefined;
    const allMarks = overs.flatMap((o) => o.deliveryMarks);
    const currentOver = overs.find((o) => !o.complete);
    const completedOvers = overs.filter((o) => o.complete).length;
    const lastCompleted = overs.findLast((o) => o.complete);

    const row: BowlerRow = {
      hasComeOn: deliveries.deliveryIds.length > 0 || state.currentBowlerId === Number(id),
      atAnEnd: state.currentBowlerId === Number(id) || otherEnd === Number(id),
      oversAnalysis: overs,
      wds: allMarks.reduce((s, dm) => s + dm.extras.wides, 0),
      nb: allMarks.reduce((s, dm) => s + dm.extras.noBalls, 0),
      completedOvers,
      deliveriesInCurrentOver:
        currentOver?.deliveryMarks.filter((dm) => dm.isLegal).length ?? 0,
      mdns: overs.filter((over) => over.maiden).length,
      runs,
      wkts,
      avrge,
      econ: lastCompleted && lastCompleted.cumRuns / completedOvers,
    };
    bowlers.push(row);
  }
  return bowlers;
}