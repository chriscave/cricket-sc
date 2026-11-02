// Each bowler's ink, by their number, so a ball can be traced to its bowler across the
// sheet: their marks in the bowling analysis, the balls a batter faced, the extras, the
// run tracker and the scoring rate. Eight colours, chosen to stay readable on the white
// and green rows and to be told apart with colour blindness.
const BOWLER_COLOURS = [
  "#ce0682", // magenta
  "#516000", // olive
  "#002ede", // blue
  "#b26d39", // ochre
  "#6c20a9", // purple
  "#1870a1", // teal
  "#813450", // wine
  "#7f63ee", // lavender
];

// The sheet's normal ink, for bowler 9 on, who don't have a colour of their own yet.
const NORMAL_INK = "#444";

export const bowlerColour = (id: number): string => BOWLER_COLOURS[id - 1] ?? NORMAL_INK;
