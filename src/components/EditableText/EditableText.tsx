import "./EditableText.css";
import { useRef, useState } from "react";

// Text in a cell (a player's name, the venue...), which turns into a text box when clicked.
// Enter or clicking away saves, and Escape cancels.
// value: the text entered so far ("" if none). shown: what the cell shows when not editing
// (defaults to value). label: what screen readers call the text box.
type EditableTextProps = {
  value: string;
  shown?: string;
  label: string;
  onSave: (value: string) => void;
};

export default function EditableText({ value, shown = value, label, onSave }: EditableTextProps) {
  const [draft, setDraft] = useState<string | null>(null);
  // Enter and Escape both leave by blurring, so saving happens in one place.
  const cancelled = useRef(false);
  // What had the focus before the click, e.g. the command line. Enter and Escape give it
  // back, so the scorer can carry on typing balls. Clicking away leaves the focus there.
  const returnFocusTo = useRef<HTMLElement | null>(null);

  if (draft === null) {
    return (
      <button
        type="button"
        className="et-shown"
        onMouseDown={() => (returnFocusTo.current = document.activeElement as HTMLElement | null)}
        onClick={() => setDraft(value)}
      >
        {shown}
      </button>
    );
  }
  return (
    <input
      className="et-input"
      value={draft}
      aria-label={label}
      autoFocus
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") cancelled.current = true;
        if (e.key === "Enter" || e.key === "Escape") {
          e.currentTarget.blur();
          returnFocusTo.current?.focus();
        }
      }}
      onBlur={() => {
        if (!cancelled.current) onSave(draft.trim());
        cancelled.current = false;
        setDraft(null);
      }}
    />
  );
}
