// Names the scorer has given players, by their number. Anyone not named goes by a default.
export type Names = { batters: Record<number, string>; bowlers: Record<number, string> };
export const NO_NAMES: Names = { batters: {}, bowlers: {} };

export const batterName = (names: Names, id: number) => names.batters[id] ?? `Batsman-${id}`;
export const bowlerName = (names: Names, id: number) => names.bowlers[id] ?? `Bowler-${id}`;

// Names with a player's name set, or cleared back to the default when `name` is "".
export function withName(names: Names, kind: keyof Names, id: number, name: string): Names {
  const group = { ...names[kind] };
  if (name) group[id] = name;
  else delete group[id];
  return { ...names, [kind]: group };
}

export type Rename = (kind: keyof Names, id: number, name: string) => void;
