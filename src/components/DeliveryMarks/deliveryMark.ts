import { creditedToBowler, isLegal, type Delivery, type Extras } from "@/types/delivery";

// What the analyses need to draw a ball.
export type DeliveryMark = {
  isLegal: boolean;
  batRuns: number;
  extras: Extras;
  bowlerWicket: boolean;
};

export function toDeliveryMark(d: Delivery): DeliveryMark {
  return {
    isLegal: isLegal(d),
    batRuns: d.batRuns,
    extras: d.extras,
    bowlerWicket: !!d.wicket && creditedToBowler(d.wicket.howOut),
  };
}
