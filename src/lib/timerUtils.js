export function getRemainingMs(timer, now = Date.now()) {
  const elapsed =
    timer.pausedAt !== null ? timer.pausedAt - timer.startTime : now - timer.startTime;
  return timer.totalMs - elapsed;
}

export function getCompletionKey(timer) {
  return `${timer.startTime}-${timer.totalMs}`;
}

export function formatTimeLeft(ms) {
  if (ms <= 0) return { text: '0m 0s', done: true };

  const totalSec = Math.ceil(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days > 0) return { text: `${days}d ${hrs}h ${mins}m`, done: false };
  if (hrs > 0) return { text: `${hrs}h ${mins}m ${secs}s`, done: false };
  return { text: `${mins}m ${secs}s`, done: false };
}

export function getTimerProgress(remaining, totalMs) {
  if (remaining <= 0 || totalMs <= 0) return 0;
  return Math.max(0, remaining / totalMs);
}