-- Run this in Supabase SQL Editor

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role text not null default 'student', -- 'student' or 'teacher'
  created_at timestamp with time zone default now()
);

-- Groups table (teacher creates, students join)
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text unique not null, -- 6-char join code
  teacher_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Group memberships
create table public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique(group_id, student_id)
);

-- Sessions
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  modality text not null,
  difficulty text not null,
  patient_name text,
  patient_case_id text,
  presenting text,
  hidden_condition text,
  defense_mechanism text,
  exchange_count int default 0,
  duration_seconds int default 0,
  feedback text,
  lang text default 'en',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.sessions enable row level security;

-- Policies: profiles
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Teachers can read student profiles in their groups"
  on public.profiles for select using (
    exists (
      select 1 from public.group_members gm
      join public.groups g on g.id = gm.group_id
      where gm.student_id = profiles.id and g.teacher_id = auth.uid()
    )
  );

-- Policies: groups
create policy "Teachers can create groups" on public.groups for insert with check (teacher_id = auth.uid());
create policy "Teachers can read own groups" on public.groups for select using (teacher_id = auth.uid());
create policy "Students can read groups by code" on public.groups for select using (true);

-- Policies: group_members
create policy "Students can join groups" on public.group_members for insert with check (student_id = auth.uid());
create policy "Students can see own memberships" on public.group_members for select using (student_id = auth.uid());
create policy "Teachers can see their group members" on public.group_members for select using (
  exists (select 1 from public.groups g where g.id = group_id and g.teacher_id = auth.uid())
);

-- Policies: sessions
create policy "Students can insert own sessions" on public.sessions for insert with check (student_id = auth.uid());
create policy "Students can read own sessions" on public.sessions for select using (student_id = auth.uid());
create policy "Students can update own sessions" on public.sessions for update using (student_id = auth.uid());
create policy "Teachers can read sessions of their students" on public.sessions for select using (
  exists (
    select 1 from public.group_members gm
    join public.groups g on g.id = gm.group_id
    where gm.student_id = sessions.student_id and g.teacher_id = auth.uid()
  )
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
