-- Supabase schema for AidSwift demo

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text default 'user', -- user | company | admin
  company_name text,
  avatar_url text,
  resume_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  location_name text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  resume_url text,
  cover_letter text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists sos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  message text,
  latitude double precision,
  longitude double precision,
  status text default 'pending',
  created_at timestamptz default now()
);
