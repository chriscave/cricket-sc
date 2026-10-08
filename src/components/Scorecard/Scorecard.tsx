import "./Scorecard.css";
import { useEffect, useRef, useState, type RefObject } from "react";
import BowlingAnalysis from "@/components/BowlingAnalysis";
import FallOfWickets from "@/components/FallOfWickets";
import MatchHeader from "@/components/MatchHeader";
import MatchOfficials from "@/components/MatchOfficials";
import MatchResult from "@/components/MatchResult";
import NotesRemarks from "@/components/NotesRemarks";
import RunMilestones from "@/components/RunMilestones";
import RunTracker from "@/components/RunTracker";
import BattingAnalysis from "@/components/BattingAnalysis";
import ScoreSummary from "@/components/ScoreSummary";
import ScoringRate from "@/components/ScoringRate";
import { apply, type Events, type InningsState } from "@/types/delivery";
import { selectBowlingsAnalysis } from "@/components/BowlingAnalysis";

const initialInningsState: InningsState = {
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

const events: Events = [
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 2,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      extras: {legByes: 1},
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      time: 1,
    },
  },
  { type: "endOver", nextBowlerId: 2 },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 2,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 2,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 2,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 2,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 2,
      batRuns: 0,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 2,
      batRuns: 0,
      wicket: {batterOutId: 1, howOut: {kind: "bowled"}},
      time: 1,
    },
  },
  { type: "endOver", nextBowlerId: 1 },

  // {
  //   type: "deliveryBowled",
  //   delivery: {
  //     overNumber: 1,
  //     batRuns: 0,
  //     time: 1,
  //   },
  // },
  // {
  //   type: "deliveryBowled",
  //   delivery: {
  //     overNumber: 1,
  //     batRuns: 0,
  //     time: 1,
  //   },
  // },
];

const currentState = events.reduce(apply, initialInningsState);
console.log(currentState);

// The scorecard is laid out like a paper sheet at a fixed width, then zoomed to fill
// the window. Everything scales together, and the page never scrolls sideways.
const SHEET_WIDTH = 1500;

// Scales the sheet to the width of the element it sits in (not the window, so page
// margins don't push it over the edge).
function useFitToWidth(ref: RefObject<HTMLElement | null>): number {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() =>
      setZoom(parent.clientWidth / SHEET_WIDTH),
    );
    observer.observe(parent);
    return () => observer.disconnect();
  }, [ref]);
  return zoom;
}

export default function Scorecard() {
  const sheet = useRef<HTMLDivElement>(null);
  const zoom = useFitToWidth(sheet);
  return (
    <div ref={sheet} className="container" style={{ width: SHEET_WIDTH, zoom }}>
      <div className="lhs">
        <MatchHeader />
        <BattingAnalysis />
        <div className="fow-and-score">
          <FallOfWickets />
          <ScoreSummary />
        </div>
        <div className="tracker-row">
          <div className="grow">
            <RunTracker />
          </div>
          <RunMilestones />
          <MatchOfficials />
        </div>
        <BowlingAnalysis bowlers={selectBowlingsAnalysis(currentState)} />
        <div className="result-row">
          <MatchResult />
          <NotesRemarks />
        </div>
      </div>
      <ScoringRate />
    </div>
  );
}
