import "./RunMilestones.css";

// Milestones 50, 100 ... 350. Pass `milestones` for a different set.
const DEFAULT_MILESTONES = Array.from({ length: 7 }, (_, i) => (i + 1) * 50);

// One entry per column after the runs. Order MUST match grid-template-columns in the CSS.
const COLUMNS = [
  { key: "time",    label: "Time" },
  { key: "min",     label: "Min." },
  { key: "overs",   label: "Overs" },
];

/*
  data: { 50: { time, min, overs }, 100: { ... } }   // keyed by the milestone
*/
export default function RunMilestones({ milestones = DEFAULT_MILESTONES, data = {} }) {
  return (
    <div className="run-milestones">
      <div className="rm-row rm-head">
        <div className="rm-cell">Runs</div>
        {COLUMNS.map((c) => (
          <div key={c.key} className="rm-cell">{c.label}</div>
        ))}
      </div>

      {milestones.map((m) => (
        <div key={m} className="rm-row rm-body">
          <div className="rm-cell rm-runs">{m}</div>
          {COLUMNS.map((c) => (
            <div key={c.key} className="rm-cell">{data[m]?.[c.key]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}