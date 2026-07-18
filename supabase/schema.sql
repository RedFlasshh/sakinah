-- ============================================================
-- SAKINAH — Istighfar Companion — Database Schema
-- Paste this entire file into Supabase > SQL Editor > Run
-- ============================================================

-- 1. Profiles: one row per user (public leaderboard data lives here)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Believer',
  country_flag text not null default '',
  streak int not null default 0,
  total_count bigint not null default 0,
  today_count int not null default 0,
  today_date date,
  updated_at timestamptz not null default now()
);

-- 2. Daily counts: raw daily log per user (private)
create table if not exists daily_counts (
  user_id uuid not null references profiles (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

-- 3. Row Level Security
alter table profiles enable row level security;
alter table daily_counts enable row level security;

-- Everyone (logged in) can READ profiles — needed for the leaderboard
create policy "profiles_read_all"
  on profiles for select
  to authenticated
  using (true);

-- Users can only create/update THEIR OWN profile
create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Daily counts: fully private — only the owner can read/write
create policy "daily_counts_read_own"
  on daily_counts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "daily_counts_upsert_own"
  on daily_counts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "daily_counts_update_own"
  on daily_counts for update
  to authenticated
  using (auth.uid() = user_id);
