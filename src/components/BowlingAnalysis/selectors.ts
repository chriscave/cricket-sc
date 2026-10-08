import type { Delivery, Extras, HowOut, InningsState } from "@/types/delivery";

export type DeliveryMark = {
  isLegal: boolean;
  batRuns: number;
  extras?: Extras;
  bowlerWicket: boolean;
  runOut: boolean;
};

export type Over = {
  deliveryMarks: DeliveryMark[];
  cumRuns: number;
  cumWickets: number;
  complete: boolean;
};

export type BowlerRow = {
  name?: string;
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
};
const creditedToBowler = (h: HowOut) =>
  h.kind !== "runOut" && h.kind !== "timedOut";

function toDeliveryMark(d: Delivery): DeliveryMark {
  const isLegal =
    (d.extras?.wides ? false : true) && (d.extras?.noBalls ? false : true);
  return {
    isLegal,
    batRuns: d.batRuns,
    extras: d.extras,
    bowlerWicket: !!d.wicket && creditedToBowler(d.wicket.howOut),
    runOut: d.wicket?.howOut.kind === "runOut",
  };
}

export function selectBowlingsAnalysis(state: InningsState): BowlerRow[] {
  const bowlers: BowlerRow[] = [];
  for (const deliveries of Object.values(state.bowlers)) {
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
          (d) => d.batRuns + (d.extras?.noBalls ?? 0) + (d.extras?.wides ?? 0),
        )
        .reduce((prev, curr) => prev + curr, 0);
      const bowlerWickets = overBalls.filter(
        (d) => d.wicket && creditedToBowler(d.wicket.howOut),
      ).length;

      const over: Over = {
        deliveryMarks,
        cumRuns: (previousOver?.cumRuns ?? 0) + bowlerOverRuns,
        cumWickets: (previousOver?.cumWickets ?? 0) + bowlerWickets,
        complete: overBalls[0].overNumber < state.overNumber,
      };
      overs.push(over);
    }

    const isMaiden = (over: Over) =>
      over.deliveryMarks.every(
        (dm) =>
          dm.batRuns + (dm.extras?.wides ?? 0) + (dm.extras?.noBalls ?? 0) ===
          0,
      ) && over.complete;

    const last = overs.at(-1);
    const runs = last?.cumRuns ?? 0;
    const wkts = last?.cumWickets ?? 0;
    const avrge = wkts > 0 ? runs / wkts : undefined;
    const allMarks = overs.flatMap((o) => o.deliveryMarks);
    const currentOver = overs.find((o) => !o.complete);

    const row: BowlerRow = {
      oversAnalysis: overs,
      wds: allMarks.reduce((s, dm) => s + (dm.extras?.wides ?? 0), 0),
      nb: allMarks.reduce((s, dm) => s + (dm.extras?.noBalls ?? 0), 0),
      completedOvers: overs.filter((o) => o.complete).length,
      deliveriesInCurrentOver:
        currentOver?.deliveryMarks.filter((dm) => dm.isLegal).length ?? 0,
      mdns: overs.filter((over) => isMaiden(over)).length,
      runs,
      wkts,
      avrge,
    };
    bowlers.push(row);
  }
  return bowlers;
}