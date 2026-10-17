import { useState } from "react";
import "./App.css";
import Scorecard from "@/components/Scorecard";
import CommandLine from "./components/CommandLine";
import NextBowlers from "@/components/NextBowlers";
import {
  apply,
  applyInput,
  bowlersUsed,
  currentOverDeliveries,
  hasSixLegalDeliveries,
  otherEndBowlerId,
  previousDeliveryBowlerId,
  type DeliveryInput,
  type InningsState,
} from "./types/delivery";

// TODO:
// Add wickets to command line input

const initialInnings: InningsState = {
  deliveries: [],
  batters: {
    1: { deliveryIds: [] },
    2: { deliveryIds: [] },
    3: { deliveryIds: [] },
    4: { deliveryIds: [] },
    5: { deliveryIds: [] },
    6: { deliveryIds: [] },
    7: { deliveryIds: [] },
    8: { deliveryIds: [] },
    9: { deliveryIds: [] },
    10: { deliveryIds: [] },
    11: { deliveryIds: [] },
  },
  bowlers: {
    1: { deliveryIds: [] },
    2: { deliveryIds: [] },
    3: { deliveryIds: [] },
    4: { deliveryIds: [] },
    5: { deliveryIds: [] },
    6: { deliveryIds: [] },
    7: { deliveryIds: [] },
    8: { deliveryIds: [] },
    9: { deliveryIds: [] },
    10: { deliveryIds: [] },
    11: { deliveryIds: [] },
  },
  overNumber: 1,
  currentBowlerId: 1,
  strikerId: 1,
  nonStrikerId: 2,
}

function App() {
  const [innings, setInnings] = useState<InningsState>(initialInnings)
  const sixLegalDeliveries = hasSixLegalDeliveries(currentOverDeliveries(innings));
  const handleInput = (input: DeliveryInput) => setInnings((prev) => applyInput(prev, input)) 
  const handleNextBowler = (nextBowlerId: number) => setInnings((prev) => apply(prev, { type: "endOver", nextBowlerId}))
  const usedBowlers = bowlersUsed(innings)
  const bowlerOfPreviousDelivery = previousDeliveryBowlerId(innings)
  const bowlerAtOtherEnd = otherEndBowlerId(innings)

  return (
    <>
      <div className="app">
        <Scorecard inningsState={innings}/>
      </div>
      <CommandLine onInput={handleInput}>
        {sixLegalDeliveries && (
          <NextBowlers
            usedBowlers={usedBowlers}
            bowlerOfPreviousDelivery={bowlerOfPreviousDelivery}
            bowlerAtOtherEnd={bowlerAtOtherEnd}
            onSelect={handleNextBowler}
          />
        )}
      </CommandLine>
    </>
  );
}

export default App;
