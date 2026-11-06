import "./RowToggle.css";

// A row's number box, which opens and closes the row when clicked anywhere in it. The
// chevron shows which it is (▾ open, ▸ closed). It doesn't take the focus, so the scorer
// can carry on typing balls. The button is laid over the box, which must be
// position: relative.
type RowToggleProps = { id: number; open: boolean; what: string; onToggle: () => void };

export default function RowToggle({ id, open, what, onToggle }: RowToggleProps) {
  return (
    <>
      <span className="row-toggle-label">
        {id}
        <span className="row-toggle-chevron">{open ? "▾" : "▸"}</span>
      </span>
      <button
        type="button"
        className="row-toggle-cover"
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${what} ${id}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onToggle}
      />
    </>
  );
}
