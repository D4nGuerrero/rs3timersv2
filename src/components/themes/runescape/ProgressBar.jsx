export function ProgressBar({ progress, done }) {
  return (
    <div className="progress">
      <div className="inner-shadow"></div>
      <div
        className={done ? "bar complete" : "bar"}
        style={{
          width: `${Math.min(100, Math.max(0, (1 - progress) * 100))}%`,
        }}
      ></div>
    </div>
  );
}
