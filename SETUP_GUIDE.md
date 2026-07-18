# 🕌 Sakinah — Complete Setup Guide (Baby Steps Edition)

**Total time: ~45 minutes. Total cost: ₹0.** Follow in order, don't skip. Every button name is written exactly as you'll see it on screen.

---

## What we're building
Your app will live at a real URL (like `sakinah-yourname.vercel.app`). Users sign in with **Google** or an **email link** (no passwords!), their counts sync across all their devices, and everyone appears on the global Ummah board.

Three free services power it:
| Service | What it does | Cost |
|---|---|---|
| **GitHub** | Stores your code | Free |
| **Supabase** | Database + login system | Free |
| **Vercel** | Hosts the app on the internet | Free |

---

## STEP 1 — Create your 3 accounts (10 min)

1. **GitHub** → go to `github.com` → click **Sign up** → use your email → verify. Remember your username.
2. **Supabase** → go to `supabase.com` → click **Start your project** → choose **Continue with GitHub** (easiest — one less password to remember).
3. **Vercel** → go to `vercel.com` → click **Sign Up** → choose **Continue with GitHub**.

✅ Checkpoint: You can log into all three sites.

---

## STEP 2 — Create your Supabase project (5 min)

1. In Supabase dashboard, click **New project**.
2. Fill in:
   - **Name**: `sakinah`
   - **Database Password**: click **Generate a password** → **copy it and save it somewhere safe** (you rarely need it, but don't lose it).
   - **Region**: choose **Mumbai (ap-south-1)** (closest to India = fastest).
3. Click **Create new project**. Wait ~2 minutes while it sets up.

---

## STEP 3 — Create the database tables (3 min)

1. In your Supabase project, look at the **left sidebar** → click **SQL Editor**.
2. Click **New query**.
3. Open the file **`supabase/schema.sql`** from the code I gave you → **copy the ENTIRE contents** → paste into the editor.
4. Click **Run** (bottom right).
5. You should see: `Success. No rows returned`. ✅

That's it — your database now has `profiles` and `daily_counts` tables with security rules (users can only edit their own data, but everyone can see the leaderboard).

---

## STEP 4 — Get your two secret keys (2 min)

1. Left sidebar → **Project Settings** (gear icon ⚙️ at the bottom) → **API**.
2. You'll see two things — keep this page open, you'll copy them in Step 7:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

⚠️ Only ever use the **anon public** key. NEVER copy the `service_role` key anywhere — that one is a master key.

---

## STEP 5 — Email login works already! Google login setup (10 min, can skip for now)

**Good news:** Email magic-link login works out of the box — zero setup. You can skip this step, deploy first, and come back later.

When you're ready for the Google button:

1. Go to `console.cloud.google.com` → sign in with your Google account.
2. Top bar → click the project dropdown → **New Project** → name it `sakinah` → **Create** → select it.
3. Left menu → **APIs & Services** → **OAuth consent screen**:
   - Choose **External** → **Create**
   - App name: `Sakinah`, add your email in both email fields → **Save and Continue** through all screens.
4. Left menu → **Credentials** → **+ Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - Name: `sakinah-web`
   - Under **Authorized redirect URIs** → **+ Add URI** → paste your Supabase callback URL. To find it: in Supabase → **Authentication** → **Sign In / Up** → **Auth Providers** → click **Google** → it shows a **Callback URL** — copy that exact URL here.
   - Click **Create** → a popup shows **Client ID** and **Client Secret** — keep this open.
5. Back in Supabase → **Authentication** → **Auth Providers** → **Google**:
   - Toggle **Enable**
   - Paste the **Client ID** and **Client Secret** from Google
   - Click **Save**. ✅

---

## STEP 6 — Put the code on GitHub (5 min, no coding!)

**Option A — The no-git way (easiest):**
1. Unzip the `sakinah-app.zip` I gave you on your computer.
2. Go to `github.com` → click **+** (top right) → **New repository**.
3. Name: `sakinah` → keep **Public** (or Private, both work) → click **Create repository**.
4. On the next page click **uploading an existing file**.
5. Open your unzipped `sakinah-app` folder → select **everything inside it** (the `app` folder, `lib` folder, `supabase` folder, `package.json`, etc.) → drag them all into the GitHub upload box.
6. Click **Commit changes**. ✅

**Option B — With Claude Code (if you've installed it):**
Open a terminal in the unzipped folder and just tell Claude Code:
> "Initialize a git repo here, create a GitHub repo called sakinah, and push everything."

---

## STEP 7 — Deploy on Vercel (5 min) 🚀

1. Go to `vercel.com` → **Add New…** → **Project**.
2. You'll see your GitHub repos → find **sakinah** → click **Import**.
3. Before clicking Deploy, expand **Environment Variables** and add these TWO (from Step 4):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |

4. Click **Deploy**. Wait 1–2 minutes. 🎉
5. Vercel gives you a URL like `sakinah-xxxx.vercel.app` — **copy it**.

---

## STEP 8 — Tell Supabase your app's address (2 min) ⚠️ Don't skip!

Login links need to know where to send users back:

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL**: paste your Vercel URL (e.g. `https://sakinah-xxxx.vercel.app`).
3. Under **Redirect URLs** → **Add URL** → paste the same URL again.
4. **Save**. ✅

---

## STEP 9 — Test it! (5 min)

Open your Vercel URL on your phone and check:

- [ ] Login screen appears with the Arabic أَسْتَغْفِرُ الله
- [ ] Email link login works (check spam folder if the email doesn't arrive)
- [ ] Google button works (if you did Step 5)
- [ ] Name + country screen appears after first login
- [ ] Tapping the circle counts up and plays the water-drop sound
- [ ] Close the browser, reopen → your count is still there
- [ ] Open the same URL on another device, log in with the same account → same count! (This is the sync you wanted 😄)
- [ ] Ummah tab shows you with your flag

---

## If something breaks 🔧

| Problem | Fix |
|---|---|
| "Invalid API key" or blank screen | Env variable names/values wrong in Vercel → fix them → **Deployments** → **⋯** → **Redeploy** |
| Email link says "invalid" or goes to localhost | You skipped Step 8 — set Site URL & Redirect URLs |
| Google button gives redirect error | The Callback URL in Google Console doesn't exactly match Supabase's — recheck Step 5.4 |
| Leaderboard empty | Normal until at least one person finishes onboarding |
| Anything else | Copy the error message, send it to me — I'll fix it 😄 |

---

## What it costs (recap)
**₹0/month** to start. Supabase free tier handles thousands of users. Optional custom domain ≈ ₹800–1,500/year. If the app becomes big (tens of thousands of daily users), Supabase Pro at $25/month — a very good problem to have, inshaAllah.

---

*May every tap be written in your book of deeds — and in the book of everyone who uses what you built. 🌙*
