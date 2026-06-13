import { supabase } from './supabase';
import { parseStoredImage, serializeStoredImage } from './presetImages';

const DB_TIMEOUT_MS = 8000;

async function withRetry(action, label, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(`${label} timed out after ${DB_TIMEOUT_MS}ms`);
    }, DB_TIMEOUT_MS);

    try {
      if (attempt > 1) {
        console.log(`[db] retry ${label}`, { attempt, attempts });
      }
      return await action(controller.signal);
    } catch (error) {
      lastError = error;
      console.error(`[db] ${label} attempt failed`, { attempt, error });
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError;
}

function fromDb(row) {
  const { imageKey, imageUrl } = parseStoredImage(row.image_url ?? '');
  return {
    id: row.id,
    name: row.name,
    totalMs: row.total_ms,
    startTime: row.start_time,
    pausedAt: row.paused_at,
    hidden: row.hidden,
    notes: row.notes ?? '',
    imageKey,
    imageUrl,
    createdAt: row.created_at,
  };
}

function toDb(userId, timer) {
  return {
    id: timer.id,
    user_id: userId,
    name: timer.name,
    total_ms: timer.totalMs,
    start_time: timer.startTime,
    paused_at: timer.pausedAt ?? null,
    hidden: timer.hidden,
    notes: timer.notes ?? '',
    image_url: serializeStoredImage(timer),
    created_at: timer.createdAt,
  };
}

export async function fetchTimers(userId) {
  console.log('[db] fetchTimers start', { userId });
  const { data } = await withRetry(
    async (signal) => {
      const response = await supabase
        .from('timers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .abortSignal(signal);
      if (response.error) throw response.error;
      return response;
    },
    'fetchTimers',
  );
  console.log('[db] fetchTimers success', { userId, count: data?.length ?? 0 });
  return data.map(fromDb);
}

export async function saveTimer(userId, timer) {
  const payload = toDb(userId, timer);
  console.log('[db] saveTimer start', payload);
  await withRetry(
    async (signal) => {
      const response = await supabase
        .from('timers')
        .upsert(payload, { onConflict: 'id' })
        .abortSignal(signal);
      if (response.error) throw response.error;
      return response;
    },
    'saveTimer',
  );
  console.log('[db] saveTimer success', payload.id);
}

export async function deleteTimer(userId, timerId) {
  console.log('[db] deleteTimer start', { userId, timerId });
  await withRetry(
    async (signal) => {
      const response = await supabase
        .from('timers')
        .delete()
        .eq('id', timerId)
        .eq('user_id', userId)
        .abortSignal(signal);
      if (response.error) throw response.error;
      return response;
    },
    'deleteTimer',
  );
  console.log('[db] deleteTimer success', { userId, timerId });
}

export async function deleteAllTimers(userId) {
  console.log('[db] deleteAllTimers start', { userId });
  await withRetry(
    async (signal) => {
      const response = await supabase
        .from('timers')
        .delete()
        .eq('user_id', userId)
        .abortSignal(signal);
      if (response.error) throw response.error;
      return response;
    },
    'deleteAllTimers',
  );
  console.log('[db] deleteAllTimers success', { userId });
}
