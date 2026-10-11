import { useState } from "react";
import "./App.css";
import Scorecard from "@/components/Scorecard";
import CommandLine from "./components/CommandLine";
import { applyInput, type DeliveryInput, type InningsState } from "./types/delivery";

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
  const handleInput = (input: DeliveryInput) => setInnings((prev) => applyInput(prev, input)) 
  return (
    <>
      <Scorecard />
      <CommandLine onInput={handleInput}/>
    </>
  );
}

export default App;
