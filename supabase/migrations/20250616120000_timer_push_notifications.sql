create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table if not exists public.timer_notification_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  timer_id text not null,
  timer_name text not null,
  completion_key text not null,
  fire_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, completion_key)
);

create index if not exists timer_notification_jobs_due_idx
  on public.timer_notification_jobs (fire_at)
  where sent_at is null;

alter table public.push_subscriptions enable row level security;
alter table public.timer_notification_jobs enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own timer notification jobs"
  on public.timer_notification_jobs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);