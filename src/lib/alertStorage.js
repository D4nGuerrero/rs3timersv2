export const ALERT_DB_NAME = 'danny-timers-alerts-v1';
export const ALERT_DB_VERSION = 1;
export const ALERTS_STORE = 'alerts';
export const FIRED_STORE = 'fired';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ALERT_DB_NAME, ALERT_DB_VERSION);
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

export async function replaceAlerts(alerts) {
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

export async function isAlertFired(completionKey) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIRED_STORE, 'readonly');
    const store = tx.objectStore(FIRED_STORE);
    const request = store.get(completionKey);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(Boolean(request.result));
  });
}

export async function markAlertFired(completionKey) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIRED_STORE, 'readwrite');
    const store = tx.objectStore(FIRED_STORE);
    store.put({ completionKey, firedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}