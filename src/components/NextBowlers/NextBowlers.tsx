import { useEffect, useRef, useState, type KeyboardEvent } from "react";

// The bowlers who could bowl the next over, shown under the command line at the end
// of an over: everyone who has bowled except whoever bowled the last ball, plus a new
// bowler. Bowlers are numbered in the order they come on, so the new one is the
// highest number used + 1.
// The bowler at the other end comes first, since they normally bowl next. It takes
// the focus when it appears, starting on the first bowler: ← and → choose, Enter
// confirms.
type NextBowlersProps = {
  usedBowlers: number[];
  bowlerOfPreviousDelivery: number | undefined;
  bowlerAtOtherEnd: number | undefined;
  onSelect: (bowlerId: number) => void;
};

const MAX_BOWLERS = 11;

export default function NextBowlers({
  usedBowlers,
  bowlerOfPreviousDelivery,
  bowlerAtOtherEnd,
  onSelect,
}: NextBowlersProps) {
  const bowlers = usedBowlers
    .filter((id) => id !== bowlerOfPreviousDelivery)
    .sort((a, b) => Number(b === bowlerAtOtherEnd) - Number(a === bowlerAtOtherEnd))
    .map((id) => ({ id, name: `Bowler ${id}` }));

  const newBowlerId = Math.max(0, ...usedBowlers) + 1;
  if (newBowlerId <= MAX_BOWLERS) {
    bowlers.push({ id: newBowlerId, name: "New bowler" });
  }

  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, bowlers.length - 1);

  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSelected(Math.max(0, index - 1));
    else if (e.key === "ArrowRight") setSelected(Math.min(bowlers.length - 1, index + 1));
    else if (e.key === "Enter") onSelect(bowlers[index].id);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={list}
      className="dock-panel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label="Next bowler"
    >
      <span>Next bowler (← → Enter):</span>
      <ul className="dock-panel-list">
        {bowlers.map((b, i) => (
          <li
            key={b.id}
            role="option"
            aria-selected={i === index}
            className={i === index ? "selected" : undefined}
          >
            {b.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
