let registrationPromise = null;

export function isServiceWorkerSupported() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerSupported()) return null;

  if (!registrationPromise) {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    registrationPromise = navigator.serviceWorker
      .register(swUrl, {
        scope: import.meta.env.BASE_URL,
      })
      .then((registration) => {
        console.log('[sw] registered', registration.scope);
        return registration;
      })
      .catch((error) => {
        console.error('[sw] registration failed', error);
        registrationPromise = null;
        return null;
      });
  }

  return registrationPromise;
}

function waitForReady(timeoutMs = 4000) {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Service worker ready timeout')), timeoutMs);
    }),
  ]);
}

export async function getServiceWorkerRegistration() {
  if (!isServiceWorkerSupported()) return null;

  const registration = await registerServiceWorker();
  if (!registration) return null;
  if (registration.active) return registration;

  try {
    return await waitForReady();
  } catch (error) {
    console.warn('[sw] ready timeout, using registration without active worker', error);
    return registration;
  }
}

export async function postToServiceWorker(message) {
  const registration = await getServiceWorkerRegistration();
  const worker = registration?.active || registration?.waiting || navigator.serviceWorker.controller;
  if (!worker) return false;
  worker.postMessage(message);
  return true;
}
