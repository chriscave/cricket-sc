import { useState } from "react";
import "./App.css";
import Scorecard from "@/components/Scorecard";
import CommandLine from "./components/CommandLine";
import Dock from "@/components/Dock";
import NextBowlers from "@/components/NextBowlers";
import {
  apply,
  applyInput,
  batsmanOffStrike,
  batsmanOnStrike,
  bowlersUsed,
  currentOverDeliveries,
  hasSixLegalDeliveries,
  otherEndBowlerId,
  previousDeliveryBowlerId,
  type DeliveryInput,
  type InningsState,
} from "./types/delivery";
import BowlerWicketHowOut, {
  type BowlerWicketKind,
} from "./components/BowlerWicketHowOut/BowlerWicketHowOut";
import RunOutBatsman from "./components/RunOutBatsman";

// TODO:
// Handle stumping off a wide
// Fix breaking app when 10 wickets have fallen
// Support for short runs
// Support for long and short overs
// Support for retired
// Add runouts --> Done
// Add wickets to command line input --> Done

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
};

function App() {
  const [innings, setInnings] = useState<InningsState>(initialInnings);
  // A ball that took a wicket, waiting for the scorer to choose how the batter was out.
  // It isn't recorded until then.
  const [pendingWicket, setPendingWicket] = useState<DeliveryInput | null>(
    null,
  );
  const [pendingRunOut, setPendingRunOut] = useState<DeliveryInput | null>(
    null,
  );
  const sixLegalDeliveries = hasSixLegalDeliveries(
    currentOverDeliveries(innings),
  );
  const strikerId = batsmanOnStrike(innings);
  const nonStrikerId = batsmanOffStrike(innings);
  const handleInput = (input: DeliveryInput) =>
    setInnings((prev) => applyInput(prev, input));
  const handleCommand = (
    input: DeliveryInput,
    needsHowOut: boolean,
    needsRunOutBatsman: boolean,
  ) =>
    needsHowOut
      ? setPendingWicket(input)
      : needsRunOutBatsman
        ? setPendingRunOut(input)
        : handleInput(input);
  // Bowler's wickets always dismiss the striker.
  const handleHowOut = (kind: BowlerWicketKind) => {
    if (!pendingWicket || innings.strikerId === null) return;
    // TODO: validate the finished ball (e.g. no stumping off a no ball) once wickets
    // can be combined with extras.
    handleInput({
      ...pendingWicket,
      wicket: { batterOutId: innings.strikerId, howOut: { kind } },
    });
    setPendingWicket(null);
  };
  const handleRunOut = (batterOutId: number) => {
    if (!pendingRunOut) return;
    handleInput({
      ...pendingRunOut,
      wicket: { batterOutId, howOut: { kind: "runOut" } },
    });
    setPendingRunOut(null);
  };
  const handleNextBowler = (nextBowlerId: number) =>
    setInnings((prev) => apply(prev, { type: "endOver", nextBowlerId }));
  const usedBowlers = bowlersUsed(innings);
  const bowlerOfPreviousDelivery = previousDeliveryBowlerId(innings);
  const bowlerAtOtherEnd = otherEndBowlerId(innings);

  return (
    <>
      <div className="app">
        <Scorecard inningsState={innings} />
      </div>
      <Dock>
        {pendingWicket ? (
          <BowlerWicketHowOut
            onSelect={handleHowOut}
            onCancel={() => setPendingWicket(null)}
          />
        ) : pendingRunOut && strikerId !== null && nonStrikerId !== null ? (
          <RunOutBatsman
            onSelect={handleRunOut}
            onCancel={() => setPendingRunOut(null)}
            strikerId={strikerId}
            nonStrikerId={nonStrikerId}
          />
        ) : sixLegalDeliveries ? (
          <NextBowlers
            usedBowlers={usedBowlers}
            bowlerOfPreviousDelivery={bowlerOfPreviousDelivery}
            bowlerAtOtherEnd={bowlerAtOtherEnd}
            onSelect={handleNextBowler}
          />
        ) : (
          <CommandLine onInput={handleCommand} />
        )}
      </Dock>
    </>
  );
}

export default App;
