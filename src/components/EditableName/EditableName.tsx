import "./EditableName.css";
import { useRef, useState } from "react";

// A player's name in a table cell, which turns into a text box when clicked. Enter or
// clicking away saves, and Escape cancels.
// name: the name entered so far ("" if none). shown: what the cell shows when not editing.
type EditableNameProps = { name: string; shown: string; onRename: (name: string) => void };

export default function EditableName({ name, shown, onRename }: EditableNameProps) {
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
        className="en-shown"
        onMouseDown={() => (returnFocusTo.current = document.activeElement as HTMLElement | null)}
        onClick={() => setDraft(name)}
      >
        {shown}
      </button>
    );
  }
  return (
    <input
      className="en-input"
      value={draft}
      aria-label="name"
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
        if (!cancelled.current) onRename(draft.trim());
        cancelled.current = false;
        setDraft(null);
      }}
    />
  );
}
