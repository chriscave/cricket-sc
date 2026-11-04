import "./RowToggle.css";
import type { MouseEvent } from "react";

// A row's number, which opens and closes the row when clicked. The chevron shows which it
// is (▾ open, ▸ closed). It doesn't take the focus, so the scorer can carry on typing balls.
// fillBox: the whole number box is the target, not just the number. The button is laid
// over the box, which must be position: relative.
type RowToggleProps = {
  id: number;
  open: boolean;
  what: string;
  onToggle: () => void;
  fillBox?: boolean;
};

export default function RowToggle({ id, open, what, onToggle, fillBox }: RowToggleProps) {
  const label = (
    <>
      {id}
      <span className="row-toggle-chevron">{open ? "▾" : "▸"}</span>
    </>
  );
  const buttonProps = {
    type: "button" as const,
    "aria-expanded": open,
    "aria-label": `${open ? "Close" : "Open"} ${what} ${id}`,
    onMouseDown: (e: MouseEvent) => e.preventDefault(),
    onClick: onToggle,
  };
  if (!fillBox) return <button className="row-toggle" {...buttonProps}>{label}</button>;
  return (
    <>
      <span className="row-toggle row-toggle-label">{label}</span>
      <button className="row-toggle-cover" {...buttonProps} />
    </>
  );
}
