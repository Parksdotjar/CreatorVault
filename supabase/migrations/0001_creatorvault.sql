-- CreatorVault schema + RLS

create extension if not exists "citext";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username citext unique not null,
  display_name text,
  bio text,
  socials jsonb not null default '{}'::jsonb,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Assets
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('png','background','sfx','preset','video')),
  tags text[] not null default '{}',
  minecraft_version text,
  license text not null check (license in ('personal','commercial','cc0','custom')),
  visibility text not null default 'public' check (visibility in ('public','private')),
  status text not null default 'uploading' check (status in ('uploading','ready','failed')),
  storage_bucket text not null default 'creatorvault-assets',
  storage_path text,
  mime_type text,
  file_size bigint,
  download_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Downloads
create table if not exists public.asset_downloads (
  id bigserial primary key,
  asset_id uuid not null references public.assets(id) on delete cascade,
  downloader_id uuid references public.profiles(id),
  ip_hash text,
  created_at timestamptz not null default now()
);

-- Reports
create table if not exists public.asset_reports (
  id bigserial primary key,
  asset_id uuid not null references public.assets(id) on delete cascade,
  reporter_id uuid references public.profiles(id),
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

-- Prevent username updates
create or replace function public.prevent_username_update()
returns trigger as $$
begin
  if new.username <> old.username then
    raise exception 'Username is immutable.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_profiles_username_update on public.profiles;
create trigger prevent_profiles_username_update
before update on public.profiles
for each row execute function public.prevent_username_update();

-- Auto-create profiles on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'username' is null then
    raise exception 'Username required';
  end if;
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Indexes
create index if not exists assets_type_idx on public.assets (type);
create index if not exists assets_created_at_idx on public.assets (created_at desc);
create index if not exists assets_download_count_idx on public.assets (download_count desc);
create index if not exists assets_tags_idx on public.assets using gin (tags);

-- Helper for admin checks
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable;

-- RLS
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.asset_downloads enable row level security;
alter table public.asset_reports enable row level security;

-- Profiles policies
drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable"
on public.profiles for select
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Assets policies
drop policy if exists "Public assets are viewable" on public.assets;
create policy "Public assets are viewable"
on public.assets for select
using (visibility = 'public' and status = 'ready');

drop policy if exists "Owners can view their assets" on public.assets;
create policy "Owners can view their assets"
on public.assets for select
using (owner_id = auth.uid());

drop policy if exists "Owners can insert assets" on public.assets;
create policy "Owners can insert assets"
on public.assets for insert
with check (owner_id = auth.uid());

drop policy if exists "Owners can update assets" on public.assets;
create policy "Owners can update assets"
on public.assets for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete assets" on public.assets;
create policy "Owners can delete assets"
on public.assets for delete
using (owner_id = auth.uid());

-- Download policies
drop policy if exists "Anyone can log downloads" on public.asset_downloads;
create policy "Anyone can log downloads"
on public.asset_downloads for insert
with check (downloader_id is null or downloader_id = auth.uid());

drop policy if exists "Owners can view download logs" on public.asset_downloads;
create policy "Owners can view download logs"
on public.asset_downloads for select
using (
  exists (
    select 1 from public.assets
    where assets.id = asset_downloads.asset_id
      and assets.owner_id = auth.uid()
  )
);

-- Reports policies
drop policy if exists "Anyone can report assets" on public.asset_reports;
create policy "Anyone can report assets"
on public.asset_reports for insert
with check (true);

drop policy if exists "Admins can view reports" on public.asset_reports;
create policy "Admins can view reports"
on public.asset_reports for select
using (public.is_admin());

-- Grants
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

grant select on public.assets to anon, authenticated;
grant insert, update, delete on public.assets to authenticated;

grant insert on public.asset_downloads to anon, authenticated;
grant select on public.asset_downloads to authenticated;

grant insert on public.asset_reports to anon, authenticated;
grant select on public.asset_reports to authenticated;

-- Storage bucket + policies
insert into storage.buckets (id, name, public)
values ('creatorvault-assets', 'creatorvault-assets', false)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

drop policy if exists "CreatorVault uploads" on storage.objects;
create policy "CreatorVault uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'creatorvault-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "CreatorVault updates" on storage.objects;
create policy "CreatorVault updates"
on storage.objects for update
to authenticated
using (
  bucket_id = 'creatorvault-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "CreatorVault deletes" on storage.objects;
create policy "CreatorVault deletes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'creatorvault-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
