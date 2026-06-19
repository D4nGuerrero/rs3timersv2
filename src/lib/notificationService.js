import { getServiceWorkerRegistration } from './serviceWorkerRegistration';

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function isNotificationGranted() {
  return getNotificationPermission() === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

function buildNotificationOptions(timer) {
  const notificationTag = timer.completionKey || `timer-${timer.id}`;
  return {
    body: 'Your timer is ready!',
    tag: notificationTag,
    renotify: true,
    silent: false,
    data: {
      url: `${window.location.origin}${import.meta.env.BASE_URL}`,
      completionKey: timer.completionKey ?? null,
    },
    requireInteraction: false,
  };
}

function showViaNotificationApi(title, options) {
  const notification = new Notification(title, options);
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  return true;
}

async function showViaServiceWorker(title, options) {
  const registration = await getServiceWorkerRegistration();
  if (!registration?.showNotification) return false;
  await registration.showNotification(title, options);
  return true;
}

export async function showTimerNotification(timer) {
  if (!isNotificationGranted()) return false;

  const options = buildNotificationOptions(timer);

  try {
    const preferServiceWorker =
      document.visibilityState !== 'visible' || typeof window === 'undefined';
    if (preferServiceWorker) {
      const notified = await showViaServiceWorker(timer.name, options);
      if (notified) return true;
    }
  } catch (error) {
    console.warn('[notify] preferred service worker notification failed', error);
  }

  try {
    return showViaNotificationApi(timer.name, options);
  } catch (error) {
    console.warn('[notify] Notification API failed, trying service worker', error);
  }

  try {
    return await showViaServiceWorker(timer.name, options);
  } catch (error) {
    console.error('[notify] service worker notification failed', error);
    return false;
  }
}

export async function showTestNotification() {
  if (!isNotificationGranted()) return false;

  const options = {
    body: 'Notifications are working! Alerts can fire even when this tab is in the background.',
    tag: `timer-test-${Date.now()}`,
    renotify: true,
    silent: false,
    data: {
      url: `${window.location.origin}${import.meta.env.BASE_URL}`,
    },
  };

  try {
    const notified = await showViaServiceWorker("Danny's Timers", options);
    if (notified) return true;
  } catch (error) {
    console.warn('[notify] test via service worker failed, trying Notification API', error);
  }

  try {
    return showViaNotificationApi("Danny's Timers", options);
  } catch (error) {
    console.warn('[notify] test via Notification API failed', error);
  }

  try {
    return await showViaServiceWorker("Danny's Timers", options);
  } catch (error) {
    console.error('[notify] test notification failed', error);
    return false;
  }
}

export async function alertTimerReady(timer, { onToast } = {}) {
  const notified = await showTimerNotification(timer);
  onToast?.(`"${timer.name}" is ready! ${notified ? '🔔' : '⏱️'}`);
  return notified;
}
