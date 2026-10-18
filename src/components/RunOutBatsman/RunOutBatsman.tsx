import { useEffect, useRef, useState, type KeyboardEvent } from "react";

// Dismissals credited to the bowler. Run outs and timed out aren't chosen here.
// export type BowlerWicketKind = Exclude<HowOut["kind"], "runOut" | "timedOut">;

// const KINDS: { kind: BowlerWicketKind; label: string }[] = [
//   { kind: "bowled", label: "Bowled" },
//   { kind: "caught", label: "Caught" },
//   { kind: "lbw", label: "LBW" },
//   { kind: "stumped", label: "Stumped" },
//   { kind: "hitWicket", label: "Hit wicket" },
// ];

// How the batter was out, chosen after a wicket is entered. It takes the focus when
// it appears: ← and → choose, Enter confirms, Esc cancels the wicket.
type RunOutBatsmanProps = {
  onSelect: (batsmanId: number) => void;
  onCancel: () => void;
  strikerId: number;
  nonStrikerId: number
};

export default function RunOutBatsman({ onSelect, onCancel , strikerId, nonStrikerId}: RunOutBatsmanProps) {
  const [selected, setSelected] = useState(0);

  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.focus();
  }, []);

  const BATSMAN: {id: number, name: string}[] = [{id: strikerId, name: `Batsman-${strikerId}`}, {id: nonStrikerId, name: `Batsman-${nonStrikerId}`}]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSelected(Math.max(0, selected - 1));
    else if (e.key === "ArrowRight") setSelected(Math.min(BATSMAN.length - 1, selected + 1));
    else if (e.key === "Enter") onSelect(BATSMAN[selected].id);
    else if (e.key === "Escape") onCancel();
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
      aria-label="Batsman run out"
    >
      <span>Batsman run out (← → Enter, Esc to cancel):</span>
      <ul className="dock-panel-list">
        {BATSMAN.map((b, i) => (
          <li
            key={b.id}
            role="option"
            aria-selected={i === selected}
            className={i === selected ? "selected" : undefined}
          >
            {b.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
