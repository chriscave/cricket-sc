import "./FallOfWickets.css";

const WICKETS = Array.from({ length: 10 }, (_, i) => i);

// One entry per row in the book. `key` is the field read from each wicket's data.
const ROWS = [
  { key: "score",       label: "Score" },
  { key: "outgoing",    label: "Outgoing bat & score" },
  { key: "notOut",      label: "N.O. batsman & score" },
  { key: "partnership", label: "Partnership" },
  { key: "time",        label: "Time/over no." },
];

/*
  wickets: [{ score, outgoing, notOut, partnership, time }, ...]  // index 0 = 1st wicket
*/
export default function FallOfWickets({ wickets = [] }) {
  return (
    <div className="fall-of-wickets">
      <div className="fw-row fw-head">
        <div className="fw-cell">Fall of wkt</div>
        {WICKETS.map((w) => (
          <div key={w} className="fw-cell">{w + 1}</div>
        ))}
      </div>

      {ROWS.map((r) => (
        <div key={r.key} className="fw-row fw-body">
          <div className="fw-cell fw-label">{r.label}</div>
          {WICKETS.map((w) => (
            <div key={w} className="fw-cell">{wickets[w]?.[r.key]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}