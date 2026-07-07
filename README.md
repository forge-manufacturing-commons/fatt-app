# Forge-A-Truck-Thon — coordination platform

Production starter: React (Vite) front end + Supabase (Postgres) back end.
Showcase page, live keiretsu build board, and three-tier diaspora intake for the NAWEDOAM build.

It runs immediately in **demo mode** (seed data, no backend). Wire Supabase to go live and multi-user.

---

## What you need installed

1. **Node.js 18+** — https://nodejs.org (LTS). Check: `node -v`
2. **VS Code** — https://code.visualstudio.com
3. A free **Supabase account** — https://supabase.com (only when you're ready to go live)

---

## Run it locally (demo mode — 3 commands)

Open this folder in VS Code, then in the terminal (Terminal → New Terminal):

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).
You'll see the platform running on seed data, with a "Demo mode" banner. Everything works —
the board, the role filters, the intake forms — it just isn't saving to a database yet.

---

## Go live with Supabase (multi-user, real data)

1. Create a new project at https://supabase.com (free tier is fine).
2. In the Supabase dashboard: **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**. This creates the tables, security rules,
   and seeds the eight NAWEDOAM component families.
3. In the dashboard: **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
4. In this folder, copy `.env.example` to `.env` and paste your two values in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhb....
   ```
5. Restart the dev server (`Ctrl+C`, then `npm run dev`). The demo banner disappears —
   the board now reads and writes to your live database, and diaspora intake forms save real leads.

---

## What's here

```
src/
  App.jsx              app shell + nav + routes
  pages/
    Showcase.jsx       public landing — hero, stats, keiretsu grid  (the outreach destination)
    Board.jsx          private build board — roles, drag stages, safety sign-off gate
    Join.jsx           three-tier diaspora intake (mentorship / in-kind / capital)
  components/
    Mandala.jsx        Ankara dotted-mandala hero motif
  lib/
    supabase.js        Supabase client + data helpers (falls back to seed data in demo mode)
  styles/app.css       livery-derived palette (brown / pink / teal / gold / cream)
supabase/
  schema.sql           run this in Supabase to create + seed the database
```

---

## Deploy it to the web (so outreach letters can link to it)

Once it runs locally, deploy free on **Vercel** or **Netlify**:
- Push this folder to a GitHub repo.
- Connect the repo on Vercel/Netlify, set the two `VITE_` env vars in their dashboard.
- They build and host it; you get a public URL to put in every outreach letter.

---

## Notes for the next build phase

- **Auth / real logins:** the schema's row-level security already gates board writes to
  authenticated users. Add Supabase Auth (email or magic-link) and per-role policies when
  you onboard real SME partners and HODs.
- **The board IS the keiretsu map.** Editing `component_jobs` in the database updates the
  live map — no more re-typing a component table each session.
- **The record head count** sums from `component_jobs.head_count` automatically — GWR evidence
  falls out of the data instead of being reconstructed after.
- Attribution required on published renders: *Base 3D model: "Kei Truck" by grs (Sketchfab), CC-BY 4.0, modified.*
