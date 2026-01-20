-- Blogs table for admin-managed content
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text null,
  content_md text not null,
  cover_image_url text null,
  published boolean not null default false,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

create index if not exists blogs_published_idx on public.blogs (published);
create index if not exists blogs_created_at_idx on public.blogs (created_at desc);

-- Public can read published blogs
drop policy if exists "Public can read published blogs" on public.blogs;
create policy "Public can read published blogs" on public.blogs
  for select
  using (published = true);

-- Admins can read all blogs
drop policy if exists "Admins can read all blogs" on public.blogs;
create policy "Admins can read all blogs" on public.blogs
  for select
  using (is_admin(auth.uid()));

-- Admins can insert blogs
drop policy if exists "Admins can insert blogs" on public.blogs;
create policy "Admins can insert blogs" on public.blogs
  for insert
  with check (is_admin(auth.uid()));

-- Admins can update blogs
drop policy if exists "Admins can update blogs" on public.blogs;
create policy "Admins can update blogs" on public.blogs
  for update
  using (is_admin(auth.uid()));

-- Admins can delete blogs
drop policy if exists "Admins can delete blogs" on public.blogs;
create policy "Admins can delete blogs" on public.blogs
  for delete
  using (is_admin(auth.uid()));

-- Storage bucket policies (create bucket: blog-images, public)
-- Run these in SQL editor after creating the bucket.
-- Public read
-- create policy "Public can view blog images" on storage.objects
--   for select using (bucket_id = 'blog-images');
--
-- Admin write
-- create policy "Admins can upload blog images" on storage.objects
--   for insert with check (bucket_id = 'blog-images' and is_admin(auth.uid()));
--
-- create policy "Admins can update blog images" on storage.objects
--   for update using (bucket_id = 'blog-images' and is_admin(auth.uid()));
--
-- create policy "Admins can delete blog images" on storage.objects
--   for delete using (bucket_id = 'blog-images' and is_admin(auth.uid()));
