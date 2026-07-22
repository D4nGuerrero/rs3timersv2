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
4. Start dev:
   - `npm run dev`

## Build

- `npm run build`

## Supabase setup

Link your Supabase project and push local migrations when needed:

- `supabase db push`

## Notes

- Preset timer images are stored via stable preset keys instead of build-specific asset URLs.
