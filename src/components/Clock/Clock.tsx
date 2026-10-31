// A time on a 24 hour clock, e.g. 14:05.
export default function Clock({ at, className }: { at?: number; className?: string }) {
  if (at === undefined) return null;
  const clock = new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return <span className={className}>{clock}</span>;
}
