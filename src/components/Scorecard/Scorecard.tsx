import "./Scorecard.css";
import { useEffect, useRef, useState, type RefObject } from "react";
import BowlingAnalysis from "@/components/BowlingAnalysis";
import FallOfWickets, { selectFallOfWickets } from "@/components/FallOfWickets";
import MatchHeader from "@/components/MatchHeader";
import MatchOfficials from "@/components/MatchOfficials";
import MatchResult from "@/components/MatchResult";
import NotesRemarks from "@/components/NotesRemarks";
import RunMilestones from "@/components/RunMilestones";
import RunTracker, { selectRunTracker } from "@/components/RunTracker";
import BattingAnalysis, { selectBattingAnalysis } from "@/components/BattingAnalysis";
import ScoreSummary, { selectScoreSummary } from "@/components/ScoreSummary";
import ScoringRate from "@/components/ScoringRate";
import type { InningsState } from "@/scoring";
import { selectBowlingsAnalysis } from "@/components/BowlingAnalysis";

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

type ScorecardProps = {
  inningsState: InningsState;
};

export default function Scorecard({ inningsState }: ScorecardProps) {
  const sheet = useRef<HTMLDivElement>(null);
  const zoom = useFitToWidth(sheet);
  return (
    <div ref={sheet} className="container" style={{ width: SHEET_WIDTH, zoom }}>
      <div className="lhs">
        <MatchHeader />
        <BattingAnalysis innings={selectBattingAnalysis(inningsState)} />
        <div className="fow-and-score">
          <FallOfWickets wickets={selectFallOfWickets(inningsState)} />
          <ScoreSummary {...selectScoreSummary(inningsState)} />
        </div>
        <div className="tracker-row">
          <div className="grow">
            <RunTracker {...selectRunTracker(inningsState)} />
          </div>
          <RunMilestones />
          <MatchOfficials />
        </div>
        <BowlingAnalysis bowlers={selectBowlingsAnalysis(inningsState)} />
        <div className="result-row">
          <MatchResult />
          <NotesRemarks />
        </div>
      </div>
      <ScoringRate />
    </div>
  );
}
