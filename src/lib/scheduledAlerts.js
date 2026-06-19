import { getCompletionKey, getRemainingMs } from './timerUtils';
import { isAlertFired, markAlertFired, replaceAlerts } from './alertStorage';
import { postToServiceWorker } from './serviceWorkerRegistration';
import { showTimerNotification } from './notificationService';
import { syncPushNotificationJobs } from './pushService';

export function buildAlertFromTimer(timer) {
  if (!timer.notify || timer.pausedAt !== null) return null;

  return {
    timerId: timer.id,
    name: timer.name,
    endTime: timer.startTime + timer.totalMs,
    completionKey: getCompletionKey(timer),
  };
}

export function buildAlertsFromTimers(timers) {
  return timers.map(buildAlertFromTimer).filter(Boolean);
}

export async function syncScheduledAlerts(timers, userId = null) {
  const alerts = buildAlertsFromTimers(timers);
  await replaceAlerts(alerts);
  await postToServiceWorker({ type: 'SYNC_ALERTS', alerts });
  await syncPushNotificationJobs(alerts, userId);
}

export async function fireAlertIfDue(alert, { onToast, includeToast = true } = {}) {
  if (alert.endTime > Date.now()) return false;
  if (await isAlertFired(alert.completionKey)) return false;

  if (includeToast) {
    onToast?.(`"${alert.name}" is ready! ⏱️`);
  }

  await showTimerNotification({
    id: alert.timerId,
    name: alert.name,
    completionKey: alert.completionKey,
  });

  await markAlertFired(alert.completionKey);
  return true;
}

export async function checkMissedAlerts(timers, { onToast } = {}) {
  const alerts = buildAlertsFromTimers(timers);
  let firedAny = false;

  for (const alert of alerts) {
    const fired = await fireAlertIfDue(alert, {
      onToast,
      includeToast: document.visibilityState === 'visible',
    });
    if (fired) firedAny = true;
  }

  if (firedAny) {
    await postToServiceWorker({ type: 'CHECK_ALERTS' });
  }

  return firedAny;
}

export function isTimerDueNow(timer, now = Date.now()) {
  return timer.notify && timer.pausedAt === null && getRemainingMs(timer, now) <= 0;
}
