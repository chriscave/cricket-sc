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

  if (draft === null) {
    return (
      <button type="button" className="en-shown" onClick={() => setDraft(name)}>
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
        if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
      }}
      onBlur={() => {
        if (!cancelled.current) onRename(draft.trim());
        cancelled.current = false;
        setDraft(null);
      }}
    />
  );
}
