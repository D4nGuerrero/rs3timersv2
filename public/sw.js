const DB_NAME = 'danny-timers-alerts-v1';
const DB_VERSION = 1;
const ALERTS_STORE = 'alerts';
const FIRED_STORE = 'fired';

let checkTimeoutId = null;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ALERTS_STORE)) {
        db.createObjectStore(ALERTS_STORE, { keyPath: 'timerId' });
      }
      if (!db.objectStoreNames.contains(FIRED_STORE)) {
        db.createObjectStore(FIRED_STORE, { keyPath: 'completionKey' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function getAlerts() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ALERTS_STORE, 'readonly');
    const store = tx.objectStore(ALERTS_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

async function replaceAlerts(alerts) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ALERTS_STORE, 'readwrite');
    const store = tx.objectStore(ALERTS_STORE);
    store.clear();
    for (const alert of alerts) {
      store.put(alert);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function isFired(completionKey) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIRED_STORE, 'readonly');
    const store = tx.objectStore(FIRED_STORE);
    const request = store.get(completionKey);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(Boolean(request.result));
  });
}

async function markFired(completionKey) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIRED_STORE, 'readwrite');
    const store = tx.objectStore(FIRED_STORE);
    store.put({ completionKey, firedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function showAlertNotification(alert) {
  const scope = self.registration.scope;
  await self.registration.showNotification(alert.name, {
    body: 'Your timer is ready!',
    tag: alert.completionKey || `timer-${alert.timerId}`,
    renotify: true,
    silent: false,
    data: { url: scope, completionKey: alert.completionKey },
    requireInteraction: false,
  });
}

async function checkAlerts() {
  const now = Date.now();
  const alerts = await getAlerts();

  for (const alert of alerts) {
    if (alert.endTime > now) continue;
    if (await isFired(alert.completionKey)) continue;
    await markFired(alert.completionKey);
    await showAlertNotification(alert);
  }

  scheduleNextCheck(alerts, now);
}

function scheduleNextCheck(alerts, now) {
  if (checkTimeoutId) {
    clearTimeout(checkTimeoutId);
    checkTimeoutId = null;
  }

  const upcoming = alerts
    .map((alert) => alert.endTime)
    .filter((endTime) => endTime > now);

  if (!upcoming.length) return;

  const nextEndTime = Math.min(...upcoming);
  const delay = Math.max(1000, Math.min(nextEndTime - now, 5 * 60 * 1000));

  checkTimeoutId = setTimeout(() => {
    checkAlerts().catch((error) => console.error('[sw] checkAlerts failed', error));
  }, delay);
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() =>
      checkAlerts().catch((error) => console.error('[sw] activate check failed', error)),
    ),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SYNC_ALERTS') {
    event.waitUntil(
      replaceAlerts(Array.isArray(data.alerts) ? data.alerts : [])
        .then(() => checkAlerts())
        .catch((error) => console.error('[sw] sync alerts failed', error)),
    );
    return;
  }

  if (data.type === 'CHECK_ALERTS') {
    event.waitUntil(
      checkAlerts().catch((error) => console.error('[sw] manual check failed', error)),
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});

self.addEventListener('push', (event) => {
  let payload = { title: "Danny's Timers", body: 'A timer is ready!' };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (error) {
    console.error('[sw] push payload parse failed', error);
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag || payload.completionKey || `timer-push-${Date.now()}`,
      renotify: true,
      silent: false,
      data: { url: self.registration.scope, completionKey: payload.completionKey },
    }),
  );
});
