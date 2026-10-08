import "./NotesRemarks.css";

/*
  value: the notes text (optional)
*/
export default function NotesRemarks({ value = "" }) {
  return (
    <div className="notes-remarks">
      <div className="nr-cell nr-label">Notes and remarks</div>
      <div className="nr-cell nr-field">
        <span className="nr-value">{value}</span>
      </div>
    </div>
  );
}