import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DISMISSALS, HowOut } from "@/types/delivery";

// Dismissals credited to the bowler, read from the creditedToBowler flags in DISMISSALS.
export type BowlerWicketKind = {
  [K in HowOut]: (typeof DISMISSALS)[K]["creditedToBowler"] extends true ? K : never;
}[HowOut];

const KINDS: { kind: BowlerWicketKind; label: string }[] = [
  { kind: "bowled", label: "Bowled" },
  { kind: "caught", label: "Caught" },
  { kind: "lbw", label: "LBW" },
  { kind: "stumped", label: "Stumped" },
  { kind: "hitWicket", label: "Hit wicket" },
];

// How the batter was out, chosen after a wicket is entered. It takes the focus when
// it appears: ← and → choose, Enter confirms, Esc cancels the wicket.
type BowlerWicketHowOutProps = {
  onSelect: (kind: BowlerWicketKind) => void;
  onCancel: () => void;
};

export default function BowlerWicketHowOut({ onSelect, onCancel }: BowlerWicketHowOutProps) {
  const [selected, setSelected] = useState(0);

  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSelected(Math.max(0, selected - 1));
    else if (e.key === "ArrowRight") setSelected(Math.min(KINDS.length - 1, selected + 1));
    else if (e.key === "Enter") onSelect(KINDS[selected].kind);
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
      aria-label="How out"
    >
      <span>How out (← → Enter, Esc to cancel):</span>
      <ul className="dock-panel-list">
        {KINDS.map((k, i) => (
          <li
            key={k.kind}
            role="option"
            aria-selected={i === selected}
            className={i === selected ? "selected" : undefined}
          >
            {k.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
