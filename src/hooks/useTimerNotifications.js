import { useEffect, useRef } from 'react';
import {
  buildAlertsFromTimers,
  checkMissedAlerts,
  syncScheduledAlerts,
} from '../lib/scheduledAlerts';

export function useTimerNotifications(timers, onTimerReady, userId = null) {
  const onTimerReadyRef = useRef(onTimerReady);
  onTimerReadyRef.current = onTimerReady;

  useEffect(() => {
    void syncScheduledAlerts(timers, userId);
  }, [timers, userId]);

  useEffect(() => {
    void checkMissedAlerts(timers, { onToast: onTimerReadyRef.current });
  }, [timers]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void checkMissedAlerts(timers, { onToast: onTimerReadyRef.current });
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timers]);

  useEffect(() => {
    function handlePageWake() {
      void checkMissedAlerts(timers, { onToast: onTimerReadyRef.current });
    }

    window.addEventListener('focus', handlePageWake);
    window.addEventListener('pageshow', handlePageWake);
    return () => {
      window.removeEventListener('focus', handlePageWake);
      window.removeEventListener('pageshow', handlePageWake);
    };
  }, [timers]);

  useEffect(() => {
    const alerts = buildAlertsFromTimers(timers);
    const nextAlert = alerts
      .filter((alert) => alert.endTime > Date.now())
      .sort((left, right) => left.endTime - right.endTime)[0];

    if (!nextAlert) return undefined;

    const delay = Math.max(250, nextAlert.endTime - Date.now() + 250);
    const timeoutId = window.setTimeout(() => {
      void checkMissedAlerts(timers, { onToast: onTimerReadyRef.current });
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [timers]);
}
