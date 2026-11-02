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
  batterName,
  bowlersUsed,
  currentOverDeliveries,
  DISMISSALS,
  hasSixLegalDeliveries,
  isInningsOver,
  NO_NAMES,
  otherEndBowlerId,
  possibleDismissals,
  previousDeliveryBowlerId,
  withName,
  type DeliveryInput,
  type HowOut,
  type InningsState,
  type Names,
  type Rename,
  type TypedBall,
} from "@/scoring";
import DockPicker from "@/components/DockPicker";

const howOutLabel = (h: HowOut) =>
  DISMISSALS[h].label[0].toUpperCase() + DISMISSALS[h].label.slice(1);

// A ball that took a wicket, not yet recorded. The scorer first chooses how the batter
// was out, then, if it could be either batter, which one.
type PendingWicket =
  | { awaiting: "howOut"; input: DeliveryInput }
  | { awaiting: "batterOut"; input: DeliveryInput; howOut: HowOut };

// TODO:
// In the state, one doesn't need bowlers delivery list
// Fix breaking app when 10 wickets have fallen --> Done
// Support for short runs
// Support for long and short overs
// Support for retired
// Add runouts --> Done
// Add wickets to command line input --> Done
// Handle stumping off a wide --> Done
// Other ways of being out are:  --> Done

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
  const [pendingWicket, setPendingWicket] = useState<PendingWicket | null>(null);
  const [names, setNames] = useState<Names>(NO_NAMES);
  const rename: Rename = (kind, id, name) => setNames((prev) => withName(prev, kind, id, name));
  const sixLegalDeliveries = hasSixLegalDeliveries(
    currentOverDeliveries(innings),
  );
  const strikerId = batsmanOnStrike(innings);
  const nonStrikerId = batsmanOffStrike(innings);
  const handleInput = (input: DeliveryInput) =>
    setInnings((prev) => applyInput(prev, input));
  // The ball is timed when the scorer enters it, so a wicket keeps that time while how
  // out is chosen.
  const handleCommand = (ball: TypedBall, needsHowOut: boolean) => {
    const input = { ...ball, time: Date.now() };
    if (needsHowOut) setPendingWicket({ awaiting: "howOut", input });
    else handleInput(input);
  };
  const recordWicket = (input: DeliveryInput, howOut: HowOut, batterOutId: number) => {
    handleInput({ ...input, wicket: { batterOutId, howOut } });
    setPendingWicket(null);
  };
  // Only some dismissals can be of the non-striker. For the rest the striker is out.
  const handleHowOut = (howOut: HowOut) => {
    if (!pendingWicket || strikerId === null) return;
    if (DISMISSALS[howOut].nonStrikerCanBeOut)
      setPendingWicket({ awaiting: "batterOut", input: pendingWicket.input, howOut });
    else recordWicket(pendingWicket.input, howOut, strikerId);
  };
  const handleBatterOut = (batterOutId: number) => {
    if (pendingWicket?.awaiting !== "batterOut") return;
    recordWicket(pendingWicket.input, pendingWicket.howOut, batterOutId);
  };
  const handleNextBowler = (nextBowlerId: number) =>
    setInnings((prev) => apply(prev, { type: "endOver", nextBowlerId }));
  const usedBowlers = bowlersUsed(innings);
  const bowlerOfPreviousDelivery = previousDeliveryBowlerId(innings);
  const bowlerAtOtherEnd = otherEndBowlerId(innings);

  return (
    <>
      <div className="app">
        <Scorecard inningsState={innings} names={names} onRename={rename} />
      </div>
      <Dock>
        {pendingWicket?.awaiting === "howOut" ? (
          <DockPicker
            key="howOut"
            title="How out"
            options={possibleDismissals(pendingWicket.input).map((h) => ({
              value: h,
              label: howOutLabel(h),
            }))}
            onSelect={handleHowOut}
            onCancel={() => setPendingWicket(null)}
          />
        ) : pendingWicket?.awaiting === "batterOut" &&
          strikerId !== null &&
          nonStrikerId !== null ? (
          <DockPicker
            key="batterOut"
            title="Which batter is out"
            options={[
              { value: strikerId, label: batterName(names, strikerId) },
              { value: nonStrikerId, label: batterName(names, nonStrikerId) },
            ]}
            onSelect={handleBatterOut}
            onCancel={() => setPendingWicket({ awaiting: "howOut", input: pendingWicket.input })}
          />
        ) : isInningsOver(innings) ? (
          <div className="dock-panel" role="status">
            Innings over: all out.
          </div>
        ) : sixLegalDeliveries ? (
          <NextBowlers
            names={names}
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
