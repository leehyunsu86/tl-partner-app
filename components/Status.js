import { BADGE_LABEL } from "@/lib/constants";

export function Badge({ status }) {
  return (
    <span className={`badge ${status}`}>
      <span className="b-dot"></span>
      {BADGE_LABEL[status] || status}
    </span>
  );
}

export function MiniTrack({ steps, status }) {
  const order = steps.map((s) => s.key);
  const idx = order.indexOf(status);
  return (
    <div className="mini-track">
      {order.map((s, i) => (
        <span key={s} style={{ display: "contents" }}>
          <span className={`node ${i <= idx ? "on" : ""} ${i === idx ? "cur" : ""}`}></span>
          {i < order.length - 1 && <span className={`seg-line ${i < idx ? "on" : ""}`}></span>}
        </span>
      ))}
    </div>
  );
}

export function Track({ steps, status, history, historyNote }) {
  const order = steps.map((s) => s.key);
  const idx = order.indexOf(status);
  return (
    <div className="track">
      {steps.map((s, i) => {
        const cls = i < idx ? "done" : i === idx ? "current" : "pending";
        const time = history?.[s.key];
        const note = historyNote?.[s.key];
        return (
          <div className={`track-step ${cls}`} key={s.key}>
            <div className="track-node"></div>
            <div className="track-label">{s.label}</div>
            <div className="track-time mono">{time || "대기 중"}</div>
            {note && <div className="track-note">{note}</div>}
          </div>
        );
      })}
    </div>
  );
}
