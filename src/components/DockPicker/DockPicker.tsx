import { useEffect, useRef, useState, type KeyboardEvent } from "react";

// A row of options in the dock. It takes the focus when it appears: ← and → choose,
// Enter confirms, Esc cancels.
type DockPickerProps<T> = {
  title: string;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  onCancel: () => void;
};

export default function DockPicker<T extends string | number>({
  title,
  options,
  onSelect,
  onCancel,
}: DockPickerProps<T>) {
  const [selected, setSelected] = useState(0);

  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSelected(Math.max(0, selected - 1));
    else if (e.key === "ArrowRight") setSelected(Math.min(options.length - 1, selected + 1));
    else if (e.key === "Enter") onSelect(options[selected].value);
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
      aria-label={title}
    >
      <span>{title} (← → Enter, Esc to cancel):</span>
      <ul className="dock-panel-list">
        {options.map((o, i) => (
          <li
            key={o.value}
            role="option"
            aria-selected={i === selected}
            className={i === selected ? "selected" : undefined}
          >
            {o.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
