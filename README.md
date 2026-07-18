# Sakinah — The Istighfar Companion 🕌

1,000 istighfar a day. Build your streak alongside believers around the world.

**Stack:** Next.js 14 · Supabase (Auth + Postgres) · Vercel

## Features
- Tap-to-count tasbeeh with progress ring, water-drop sounds, milestone chimes, and a serene completion tone at 1,000
- Google Sign-In + passwordless email magic links (no passwords, ever)
- Cross-device sync — same account, same progress everywhere
- Global "Ummah Board" leaderboard with country flags and streaks 🔥
- 60 authentic benefits of istighfar (Quran / Hadith / Scholars / Reflections), rotating daily
- 180-day (6-month) journey tracker

## Setup
👉 **Read `SETUP_GUIDE.md`** — a complete beginner-friendly, step-by-step walkthrough (~45 min, ₹0 cost).

Quick version for developers:
1. Create a Supabase project, run `supabase/schema.sql` in the SQL Editor
2. Copy `.env.local.example` → `.env.local`, fill in your Supabase URL + anon key
3. `npm install && npm run dev`
4. Deploy to Vercel with the same two env vars, then set your Vercel URL in Supabase → Authentication → URL Configuration

## Project structure
```
app/page.js          — the entire app (login, onboarding, counter, benefits, leaderboard, journey)
app/layout.js        — root layout + metadata
app/globals.css      — fonts, base styles, animations
lib/supabaseClient.js — Supabase client
supabase/schema.sql  — tables + row-level security policies
SETUP_GUIDE.md       — baby-steps deployment guide
```
