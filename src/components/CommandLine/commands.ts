// The scorer's slash commands, typed in the command line after "/". For now they're only
// listed; choosing one doesn't do anything yet.
export type Command = { name: string; description: string };

// Penalty runs, action award 5 runs
// Time-out. Incomming batsman is timed out. Should only between deliveries where the first delievery was a wicket.
// A batter retires (he might be hurt or out). There should also be a retired batsman coming in
// Change bowler, I'm not sure where you would continue scoring here
// There should be an /over that ends an over prematurely if the umpire has lost count
// There should also be one where the bowler has been banned from bowling any more overs
// end innings (maybe in case of forfeit or bad light or bad weather that just ends the innings)
// A bowler can run out a batsman at the non striker end before he starts his delivery stride.

export const COMMANDS: Command[] = [
  { name: "penalty",       description: "Award penalty runs" },
  { name: "short-run",     description: "Take a short run off the last ball" },
  { name: "timed-out",     description: "The incoming batter is timed out" },
  { name: "retired",       description: "A batter retires (hurt or out)" },
  { name: "swap-strike",   description: "Swap the batters on strike" },
  { name: "change-bowler", description: "A new bowler finishes the over" },
  { name: "undo",          description: "Undo the last ball" },
  { name: "declare",       description: "Declare the innings closed" },
];

// The commands matching what's been typed after the "/": names starting with it first,
// then names containing it.
export function matchCommands(query: string): Command[] {
  const q = query.toLowerCase();
  const starts = COMMANDS.filter((c) => c.name.startsWith(q));
  const contains = COMMANDS.filter((c) => !c.name.startsWith(q) && c.name.includes(q));
  return [...starts, ...contains];
}
