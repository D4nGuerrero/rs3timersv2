# RS3 Timers

RuneScape 3 timer tracker built with Vite, React, and Supabase.

## Local setup

1. Install dependencies:
   - `npm install`
2. Copy envs:
   - copy `.env.example` to `.env`
3. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_VAPID_PUBLIC_KEY` if you want real push notifications
4. Start dev:
   - `npm run dev`

## Build

- `npm run build`

## Supabase setup

Run your migrations so the notification tables exist:

- `supabase db push`

This repo includes:

- `supabase/migrations/20250616120000_timer_push_notifications.sql`
- `supabase/functions/check-timer-notifications/index.ts`

## Real push notifications

If you want notifications to work even when the app page is not open, you need web push.

### 1. Generate VAPID keys

Use any web-push VAPID generator. One easy way:

- `npx web-push generate-vapid-keys`

This gives you:

- public key
- private key

### 2. Frontend env

Put the public key in `.env`:

- `VITE_VAPID_PUBLIC_KEY=your-public-key`

### 3. Supabase function secrets

Set these in Supabase for the edge function:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Example:

- `VAPID_SUBJECT=mailto:you@example.com`

CLI examples:

- `supabase secrets set VAPID_PUBLIC_KEY=...`
- `supabase secrets set VAPID_PRIVATE_KEY=...`
- `supabase secrets set VAPID_SUBJECT=mailto:you@example.com`

### 4. Deploy the edge function

- `supabase functions deploy check-timer-notifications`

### 5. Schedule the function

Something must call the function regularly, such as every minute.

You can do this with:

- Supabase scheduled functions / cron
- an external cron job
- GitHub Actions on a schedule

The function to call is:

- `check-timer-notifications`

### 6. User requirements

For push to work, the user must:

- be signed in
- allow browser notifications
- have OS/browser notifications enabled
- enable the bell on individual timers

## Current notification behavior

Without real push:

- background tab notifications can work
- missed timers can notify when the app page is reopened
- exact-time notifications with the app page closed are not guaranteed

With real push:

- exact-time notifications can work even when the app page is closed

## Notes

- Preset timer images are stored via stable preset keys instead of build-specific asset URLs.
- The push edge function uses `completion_key` as the notification tag so repeated timer completions do not collapse into stale older notifications.
