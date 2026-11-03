import "./NotesRemarks.css";
import EditableText from "@/components/EditableText";

export type NotesRemarksValues = { notes?: string };

type NotesRemarksProps = {
  values: NotesRemarksValues;
  onEdit: (key: "notes", value: string) => void;
};

export default function NotesRemarks({ values, onEdit }: NotesRemarksProps) {
  return (
    <div className="notes-remarks">
      <div className="nr-cell nr-label">Notes and remarks</div>
      <div className="nr-cell nr-field">
        <span className="nr-value">
          <EditableText
            value={values.notes ?? ""}
            label="Notes and remarks"
            onSave={(v) => onEdit("notes", v)}
          />
        </span>
      </div>
    </div>
  );
}
