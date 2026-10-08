import "./Scorecard.css";
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
      batRuns: 1,
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 1,
      extras : {
        noBalls:1
      },
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      extras : {
        noBalls:2
      },
      time: 1,
    },
  },
  {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      extras : {
        noBalls:3
      },
      time: 1,
    },
  },
    {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      extras : {
        noBalls:4
      },
      time: 1,
    },
  },
    {
    type: "deliveryBowled",
    delivery: {
      overNumber: 1,
      batRuns: 0,
      extras : {
        noBalls:5
      },
      time: 1,
    },
  },

];

const currentState = events.reduce(apply, initialInningsState);
console.log(currentState);

export default function Scorecard() {
  return (
    <div className="container">
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
