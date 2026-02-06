# CreatorVault

Minecraft-focused asset vault for textures, backgrounds, SFX, presets, and video packs.

## Stack
- Next.js App Router + TypeScript
- TailwindCSS
- Supabase (Auth, Postgres, Storage)

## Environment variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key for signed URLs and analytics

## Supabase setup
1) Run the migration in `supabase/migrations/0001_creatorvault.sql`.
2) Create storage bucket `creatorvault-assets`:
   - Private bucket (recommended).
   - CORS allow origins:
     - `http://localhost:3000`
     - Your production domain (e.g., `https://creatorvault.yourdomain.com`)
   - Allow methods: `GET, POST, PUT, DELETE`
3) If you need an admin account, update `profiles.role = 'admin'` for your user.

> The app uses signed URLs for both public and private assets. Public assets use longer expiry.

## Run
```bash
npm install
npm run dev
npm run build
npm run start
```
