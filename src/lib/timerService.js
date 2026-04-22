/*
  ============================================================
  Run this SQL in your Supabase SQL Editor to set up the table
  and Row Level Security policies.
  ============================================================

  create table public.timers (
    id uuid primary key,
    user_id uuid references auth.users not null,
    name text not null,
    total_ms bigint not null,
    start_time bigint not null,
    paused_at bigint,
    hidden boolean not null default false,
    created_at bigint not null
  );

  alter table public.timers enable row level security;

  create policy "Users can view own timers"
    on public.timers for select
    using (auth.uid() = user_id);

  create policy "Users can insert own timers"
    on public.timers for insert
    with check (auth.uid() = user_id);

  create policy "Users can update own timers"
    on public.timers for update
    using (auth.uid() = user_id);

  create policy "Users can delete own timers"
    on public.timers for delete
    using (auth.uid() = user_id);
  ============================================================
*/

import { supabase } from './supabase'

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    totalMs: row.total_ms,
    startTime: row.start_time,
    pausedAt: row.paused_at,
    hidden: row.hidden,
    createdAt: row.created_at,
  }
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
    created_at: timer.createdAt,
  }
}

export async function fetchTimers(userId) {
  const { data, error } = await supabase
    .from('timers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(fromDb)
}

export async function saveTimer(userId, timer) {
  const { error } = await supabase
    .from('timers')
    .upsert(toDb(userId, timer))
  if (error) throw error
}

export async function deleteTimer(userId, timerId) {
  const { error } = await supabase
    .from('timers')
    .delete()
    .eq('id', timerId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function saveAllTimers(userId, timers) {
  if (!timers.length) return
  const { error } = await supabase
    .from('timers')
    .upsert(timers.map(t => toDb(userId, t)))
  if (error) throw error
}
