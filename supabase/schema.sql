-- FitForge schema + seed
-- Run in Supabase SQL Editor

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (optional link to auth.users for admin flag)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Workouts
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  duration integer not null check (duration > 0),
  created_at timestamptz not null default now()
);

-- Exercises
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  video_url text,
  image_url text,
  muscle_group text not null
);

-- Junction: workout <-> exercise
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets integer not null default 3 check (sets > 0),
  reps integer not null default 10 check (reps > 0),
  unique (workout_id, exercise_id)
);

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, workout_id)
);

-- Contact messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_workouts_level on public.workouts(level);
create index if not exists idx_exercises_muscle on public.exercises(muscle_group);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_workout_exercises_workout on public.workout_exercises(workout_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_admin)
  values (
    new.id,
    new.email,
    lower(coalesce(new.email, '')) = lower(coalesce(current_setting('app.admin_email', true), ''))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users may update their own row but cannot escalate is_admin
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Workouts: public read, admin write
create policy "Anyone can read workouts"
  on public.workouts for select using (true);

create policy "Admins manage workouts"
  on public.workouts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Exercises: public read, admin write
create policy "Anyone can read exercises"
  on public.exercises for select using (true);

create policy "Admins manage exercises"
  on public.exercises for all
  using (public.is_admin())
  with check (public.is_admin());

-- Workout exercises: public read, admin write
create policy "Anyone can read workout_exercises"
  on public.workout_exercises for select using (true);

create policy "Admins manage workout_exercises"
  on public.workout_exercises for all
  using (public.is_admin())
  with check (public.is_admin());

-- Favorites: own rows only
create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Messages: anyone insert, admin read/delete
create policy "Anyone can submit messages"
  on public.messages for insert
  with check (true);

create policy "Admins read messages"
  on public.messages for select
  using (public.is_admin());

create policy "Admins delete messages"
  on public.messages for delete
  using (public.is_admin());

-- =====================
-- SEED DATA
-- =====================

-- Clear existing seed (safe for re-run in empty project)
truncate public.workout_exercises, public.favorites, public.workouts, public.exercises, public.messages restart identity cascade;

insert into public.exercises (id, name, description, video_url, image_url, muscle_group) values
  (
    'a1000000-0000-4000-8000-000000000001',
    'Bench Press',
    'Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower to mid-chest, then press up until arms are extended. Keep feet planted and shoulder blades retracted.',
    'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    'chest'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Squat',
    'Stand with feet shoulder-width apart, brace your core, sit hips back and down until thighs are at least parallel, then drive through the mid-foot to stand. Keep chest up and knees tracking over toes.',
    'https://www.youtube.com/watch?v=ultWZbUMPL8',
    'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&q=80',
    'legs'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Deadlift',
    'Hinge at the hips with a flat back, grip the bar, drive the floor away as you extend hips and knees together. Lock out at the top without hyperextending the spine, then lower with control.',
    'https://www.youtube.com/watch?v=op9kVnSso6Q',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'back'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'Bicep Curl',
    'Hold dumbbells at your sides with palms forward. Curl the weights up by flexing the elbows without swinging. Squeeze at the top, then lower slowly to full extension.',
    'https://www.youtube.com/watch?v=ykJmrNAfMAs',
    'https://images.unsplash.com/photo-1581009146145-b5ef6e2eeefb?w=800&q=80',
    'arms'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Tricep Pushdown',
    'Stand at a cable machine with a straight or rope attachment. Keep elbows pinned to your sides and extend the forearms down until arms are straight. Control the return without letting elbows flare.',
    'https://www.youtube.com/watch?v=2-LAMcpzODU',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'arms'
  );

insert into public.workouts (id, title, description, level, duration) values
  (
    'b1000000-0000-4000-8000-000000000001',
    'Full Body Beginner',
    'A balanced introduction to strength training covering major movement patterns. Ideal if you are new to the gym or returning after a break. Focus on form over load and rest 60–90 seconds between sets.',
    'beginner',
    45
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'Push Pull Legs',
    'A classic intermediate split emphasizing upper-body push and pull plus a dedicated legs day. Rotate through the three sessions across the week for progressive overload and recovery.',
    'intermediate',
    60
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'Arm Focus Program',
    'High-volume arm specialization for lifters who want thicker biceps and triceps. Pair with a full-body or PPL template on other days. Keep rest short (45–60s) to maintain pump and density.',
    'advanced',
    40
  );

-- Full Body Beginner: squat, bench, deadlift, curl
insert into public.workout_exercises (workout_id, exercise_id, sets, reps) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 3, 10),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 3, 8),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 3, 6),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 2, 12);

-- Push Pull Legs: bench, deadlift, squat, pushdown
insert into public.workout_exercises (workout_id, exercise_id, sets, reps) values
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 4, 8),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 4, 5),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 4, 8),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000005', 3, 12);

-- Arm Focus: curl, pushdown, bench (close-grip style volume)
insert into public.workout_exercises (workout_id, exercise_id, sets, reps) values
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000004', 4, 12),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005', 4, 12),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 3, 10);

-- After creating your admin Auth user in Supabase Dashboard, promote them:
-- update public.profiles set is_admin = true where email = 'your-admin@email.com';
