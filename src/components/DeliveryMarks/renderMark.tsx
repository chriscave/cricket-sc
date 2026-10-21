import type { ReactNode } from "react";
import type { DeliveryMark } from "./deliveryMark";
import WideMark from "./WideMark";
import NoBallMark from "./NoBallMark";
import ByeMark from "./ByeMark";
import DotMark from "./DotMark";
import WicketMark from "./WicketMark";

// How a ball is drawn in the bowling and batting analyses.
export function renderMark(mark: DeliveryMark): ReactNode {
  if (mark.extras.wides) return <WideMark mark={mark} />;
  if (mark.extras.noBalls) return <NoBallMark mark={mark} />;
  if (mark.extras.byes) return <ByeMark kind="bye" />;
  if (mark.extras.legByes) return <ByeMark kind="legBye" />;
  if (mark.bowlerWicket) return <WicketMark />;
  if (mark.batRuns === 0) return <DotMark />;
  return mark.batRuns;
}
