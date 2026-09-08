# FitForge

Modern fitness web app — workout programs, exercise library, favorites, contact form, and admin CRUD. Built with React (Vite), Tailwind CSS, Framer Motion, React Router, and Supabase.

## Features

- Email/password auth with persistent sessions
- Protected routes for favorites and admin
- Workouts with level/duration filters and search
- Workout detail pages with YouTube embeds and add-to-favorites
- Exercises grid with muscle-group filter and modal detail
- Contact form persisted to Supabase
- Admin dashboard: workouts, exercises, assignments, messages
- Seed data for 3 workouts and 5 exercises

## Quick start

### 1. Install

```bash
cd Fitness
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql) (creates tables, RLS, and seed data)
3. In **Authentication → Providers**, ensure Email is enabled
4. Copy Project URL and anon key from **Settings → API**

### 3. Environment

```bash
cp .env.example .env.local
```

Set:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_EMAIL=you@example.com
```

### 4. Create an admin user

1. Sign up in the app with the same email as `VITE_ADMIN_EMAIL`
2. Or promote after signup in SQL:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

### 5. Run locally

```bash
npm run dev
```

## Deploy on Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAIL`
4. Deploy — `vercel.json` rewrites SPA routes to `index.html`

```bash
npm run build
```

## Project structure

```
src/
  components/   # UI, cards, modals, protected route
  pages/        # Public + admin pages
  hooks/        # Data & favorites hooks
  services/     # Supabase client + API
  layouts/      # Main + admin shells
  context/      # Auth provider
  types/        # Shared TypeScript types
  utils/        # Helpers
supabase/
  schema.sql    # Tables, RLS, seed
```

## Routes

| Path | Access |
|------|--------|
| `/` | Public |
| `/workouts`, `/workouts/:id` | Public |
| `/exercises` | Public |
| `/contact` | Public |
| `/login`, `/register` | Public |
| `/favorites` | Authenticated |
| `/admin/*` | Admin only |

## Notes

- Public reads on workouts/exercises; writes require admin (`profiles.is_admin`)
- Contact inserts are open; reading messages is admin-only
- Favorites are scoped to `auth.uid()` via RLS
