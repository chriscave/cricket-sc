import "./Scorecard.css";
import { useEffect, useRef, useState, type RefObject } from "react";
import BowlingAnalysis from "@/components/BowlingAnalysis";
import FallOfWickets, { selectFallOfWickets } from "@/components/FallOfWickets";
import MatchHeader, { type MatchHeaderValues } from "@/components/MatchHeader";
import MatchOfficials, { type MatchOfficialsValues } from "@/components/MatchOfficials";
import MatchResult, { type MatchResultValues } from "@/components/MatchResult";
import NotesRemarks, { type NotesRemarksValues } from "@/components/NotesRemarks";
import RunMilestones, { selectRunMilestones } from "@/components/RunMilestones";
import RunTracker, { selectRunTracker } from "@/components/RunTracker";
import BattingAnalysis, { selectBattingAnalysis } from "@/components/BattingAnalysis";
import ScoreSummary, { selectScoreSummary } from "@/components/ScoreSummary";
import ScoringRate, { selectScoringRate } from "@/components/ScoringRate";
import type { InningsState, Names, Rename } from "@/scoring";
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

// Everything the scorer writes around the sheet (match no., venue, umpires, result, notes...).
// Each block declares its own fields; the scorecard holds them all together.
export type MatchDetails = MatchHeaderValues &
  MatchOfficialsValues &
  MatchResultValues &
  NotesRemarksValues;
export type EditDetail = (key: keyof MatchDetails, value: string) => void;

type ScorecardProps = {
  inningsState: InningsState;
  names: Names;
  onRename: Rename;
  details: MatchDetails;
  onEditDetail: EditDetail;
};

export default function Scorecard({ inningsState, names, onRename, details, onEditDetail }: ScorecardProps) {
  const sheet = useRef<HTMLDivElement>(null);
  const zoom = useFitToWidth(sheet);
  return (
    <div ref={sheet} className="container" style={{ width: SHEET_WIDTH, zoom }}>
      <div className="lhs">
        <MatchHeader values={details} onEdit={onEditDetail} />
        <BattingAnalysis innings={selectBattingAnalysis(inningsState)} names={names} onRename={onRename} />
        {/* Straight under the batting, so both fit on one screen while scoring */}
        <BowlingAnalysis bowlers={selectBowlingsAnalysis(inningsState)} names={names} onRename={onRename} />
        <div className="fow-and-score">
          <FallOfWickets wickets={selectFallOfWickets(inningsState)} />
          <ScoreSummary {...selectScoreSummary(inningsState)} />
        </div>
        <div className="tracker-row">
          <div className="grow">
            <ScoringRate rates={selectScoringRate(inningsState)} />
          </div>
          <RunMilestones reached={selectRunMilestones(inningsState)} />
          <MatchOfficials values={details} onEdit={onEditDetail} />
        </div>
        <div className="result-row">
          <MatchResult values={details} onEdit={onEditDetail} />
          <NotesRemarks values={details} onEdit={onEditDetail} />
        </div>
      </div>
      {/* The run tracker runs down the right-hand side, 10 runs to a row */}
      <div className="rhs">
        <RunTracker {...selectRunTracker(inningsState)} />
      </div>
    </div>
  );
}
