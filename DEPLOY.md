# YouTube Video Analyzer — Deployment Guide

## Step 1 — Get your Supabase anon key (30 seconds)

1. Go to: https://supabase.com/dashboard/project/gyhdtbspbkxkjjbtsakx/settings/api
2. Copy the **anon / public** key
3. Open `.env.local` in the project folder and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2 — Run the Supabase migration

1. Go to: https://supabase.com/dashboard/project/gyhdtbspbkxkjjbtsakx/sql/new
2. Open `supabase/migrations/001_create_video_analyses.sql` from this folder
3. Paste the entire contents into the SQL editor and click **Run**

---

## Step 3 — Install & run locally (optional test)

Open a terminal in this folder and run:
```bash
npm install
npm run dev
```
Open http://localhost:3000 — password is `SignalStrike2025`

---

## Step 4 — Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

When prompted:
- Set up and deploy → **Y**
- Which scope → select your account
- Link to existing project → **N**
- Project name → `youtube-video-analyzer` (or anything)
- Directory → press Enter (current folder)

---

## Step 5 — Add environment variables to Vercel

After first deploy, go to:
**https://vercel.com/dashboard → your project → Settings → Environment Variables**

Add each of these:

| Key | Value |
|-----|-------|
| `GOOGLE_API_KEY` | Your Google AI Studio key |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gyhdtbspbkxkjjbtsakx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `APP_PASSWORD` | `SignalStrike2025` (or change it) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL |

Then run:
```bash
vercel --prod
```

Your app is live. ✓

---

## Notes

- `.env.local` is for **local dev only** — it never gets deployed to Vercel
- Vercel reads env vars from its own dashboard, not from `.env.local`
- If you hit Vercel's 10s function timeout on long videos, upgrade to Vercel Pro (60s limit)
  — the analyze route is already configured with `maxDuration = 120`
- Videos already analyzed are cached in Supabase — repeat requests return instantly
