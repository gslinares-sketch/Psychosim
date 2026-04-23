# PsychoSim v2 🧠
AI Patient Simulation for Psychology Trainees — with user accounts, groups, and teacher dashboard.

## Setup Guide

### 1. Supabase (Database + Auth)
1. Go to supabase.com → create account → New Project
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Go to **Authentication → Settings** → set Site URL to your Vercel URL

### 2. Upload to GitHub
1. github.com → New repository → name it `psychosim` → Private
2. Upload all files from this folder (not the folder itself)

### 3. Deploy on Vercel
1. vercel.com → Add New Project → import `psychosim`
2. Click Deploy

### 4. Add Environment Variables in Vercel
Settings → Environment Variables → add all 4:
- `ANTHROPIC_API_KEY`
- `ELEVENLABS_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Redeploy after adding variables.

### 5. Enable Email Auth in Supabase
Authentication → Providers → Email → Enable

## App Structure
- `/auth` — Login / Signup (student or teacher)
- `/dashboard` — Student: session history, join groups
- `/teacher` — Teacher: groups, students, session feedback
- `/` — The simulation itself
