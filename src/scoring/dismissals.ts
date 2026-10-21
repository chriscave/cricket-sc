interface DismissalRules {
  label: string;
  creditedToBowler: boolean;
  // Whether runs completed before the wicket still count.
  runsCount: boolean;
  offWide: boolean;
  offNoBall: boolean;
  // Caught, stumped (the keeper) and run out record who took the wicket.
  needsFielder: boolean;
  // Only run out and obstructing the field can dismiss the non-striker.
  nonStrikerCanBeOut: boolean;
}

// prettier-ignore
export const DISMISSALS = {
  bowled:              { label: "bowled",                creditedToBowler: true,  runsCount: false, offWide: false, offNoBall: false, needsFielder: false, nonStrikerCanBeOut: false },
  caught:              { label: "caught",                creditedToBowler: true,  runsCount: false, offWide: false, offNoBall: false, needsFielder: true,  nonStrikerCanBeOut: false },
  lbw:                 { label: "LBW",                   creditedToBowler: true,  runsCount: false, offWide: false, offNoBall: false, needsFielder: false, nonStrikerCanBeOut: false },
  stumped:             { label: "stumped",               creditedToBowler: true,  runsCount: false, offWide: true,  offNoBall: false, needsFielder: true,  nonStrikerCanBeOut: false },
  hitWicket:           { label: "hit wicket",            creditedToBowler: true,  runsCount: false, offWide: true,  offNoBall: false, needsFielder: false, nonStrikerCanBeOut: false },
  runOut:              { label: "run out",               creditedToBowler: false, runsCount: true,  offWide: true,  offNoBall: true,  needsFielder: true,  nonStrikerCanBeOut: true  },
  obstructingTheField: { label: "obstructing the field", creditedToBowler: false, runsCount: true,  offWide: true,  offNoBall: true,  needsFielder: false, nonStrikerCanBeOut: true  },
  hitTheBallTwice:     { label: "hit the ball twice",    creditedToBowler: false, runsCount: false, offWide: false, offNoBall: true,  needsFielder: false, nonStrikerCanBeOut: false },
} as const satisfies Record<string, DismissalRules>;

export type HowOut = keyof typeof DISMISSALS;

// Wickets credited to the bowler.
export const creditedToBowler = (h: HowOut) => DISMISSALS[h].creditedToBowler;
