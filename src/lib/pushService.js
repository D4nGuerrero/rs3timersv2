import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushConfigured() {
  return Boolean(VAPID_PUBLIC_KEY) && 'PushManager' in window;
}

export async function ensurePushSubscription(userId) {
  if (!userId || !isPushConfigured()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      { onConflict: 'user_id,endpoint' },
    );

    if (error) throw error;
    return subscription;
  } catch (error) {
    console.warn('[push] subscription skipped', error);
    return null;
  }
}

export async function syncPushNotificationJobs(alerts, userId) {
  if (!userId || !isPushConfigured()) return;

  try {
    await ensurePushSubscription(userId);

    const { error: deleteError } = await supabase
      .from('timer_notification_jobs')
      .delete()
      .eq('user_id', userId)
      .is('sent_at', null);

    if (deleteError) throw deleteError;

    if (!alerts.length) return;

    const rows = alerts.map((alert) => ({
      user_id: userId,
      timer_id: alert.timerId,
      timer_name: alert.name,
      completion_key: alert.completionKey,
      fire_at: new Date(alert.endTime).toISOString(),
    }));

    const { error: insertError } = await supabase.from('timer_notification_jobs').upsert(rows, {
      onConflict: 'user_id,completion_key',
    });

    if (insertError) throw insertError;
  } catch (error) {
    console.warn('[push] job sync skipped', error);
  }
}