import "./RunTracker.css";

/*
  total:   highest number to print (default 400)
  columns: numbers per row (default 40, giving 10 rows of 40)
  scored:  runs so far; numbers 1..scored are struck through
*/
export default function RunTracker({ total = 400, columns = 40, scored = 0 }) {
  const numbers = Array.from({ length: total }, (_, i) => i + 1);
  const rows = Math.ceil(total / columns);

  return (
    <div className="run-tracker" style={{ "--cols": columns, "--rows": rows }}>
      {numbers.map((n) => (
        <span key={n} className={n <= scored ? "rt-num rt-done" : "rt-num"}>
          {n}
        </span>
      ))}
    </div>
  );
}