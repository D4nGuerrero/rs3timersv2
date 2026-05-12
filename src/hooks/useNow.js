import { useState, useEffect } from 'react';

// Single shared interval — all subscribers get the same tick.
const subscribers = new Set();
let intervalId = null;

function tick() {
  const now = Date.now();
  subscribers.forEach((cb) => cb(now));
}

function subscribe(cb) {
  subscribers.add(cb);
  if (!intervalId) {
    intervalId = setInterval(tick, 500);
  }
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

/**
 * Returns the current timestamp, updated every 500 ms via a single shared
 * interval. Pass `active = false` to pause updates (e.g. when the timer is
 * paused) so the card stops re-rendering unnecessarily.
 */
export function useNow(active = true) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!active) return;
    return subscribe(setNow);
  }, [active]);

  return now;
}
