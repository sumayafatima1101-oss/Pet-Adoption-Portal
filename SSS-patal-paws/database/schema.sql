-- Mimme's Patal Paws - Supabase PostgreSQL schema
-- Run this once in Supabase Dashboard > SQL Editor.
-- The backend uses the service-role key, which must remain private on the server.

create extension if not exists pgcrypto;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  species text not null check (species in ('dog','cat','bird','horse','fish','turtle','rabbit','hamster','guinea pig','other')),
  breed text not null default 'Mixed / not specified',
  age numeric(5,2) check (age is null or age >= 0),
  description text not null default '',
  image_url text not null default '',
  status text not null default 'available' check (status in ('available','pending','adopted')),
  created_at timestamptz not null default now()
);

create table if not exists public.adoption_requests (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete restrict,
  applicant_name text not null check (char_length(trim(applicant_name)) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 7 and 20),
  reason text not null check (char_length(trim(reason)) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists pets_species_status_idx on public.pets(species, status);
create index if not exists adoption_requests_pet_id_idx on public.adoption_requests(pet_id);
create index if not exists adoption_requests_created_at_idx on public.adoption_requests(created_at desc);

-- Keep direct anonymous table access disabled. The private backend service-role key
-- accesses the database; never expose that key in the browser.
alter table public.pets enable row level security;
alter table public.adoption_requests enable row level security;

-- Sample pets. Re-running the schema won't duplicate these rows by name.
insert into public.pets (name, species, breed, age, description, image_url, status)
select v.name, v.species, v.breed, v.age, v.description, v.image_url, v.status
from (values
 ('Mochi','dog','Indie mix',1::numeric,'A happy little explorer who loves gentle walks and new friends.','https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80','available'),
 ('Peaches','cat','Domestic shorthair',2::numeric,'A soft-hearted nap expert who enjoys sunny windows and quiet cuddles.','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80','available'),
 ('Kiwi','bird','Budgie',1::numeric,'A curious little chatterbox who needs a safe, enriching home.','https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80','available'),
 ('Daisy','horse','Indian country horse',6::numeric,'A gentle horse who needs experienced, responsible equine care.','https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80','available'),
 ('Bubbles','fish','Betta fish',1::numeric,'A bright swimmer who needs a suitable, properly maintained aquarium.','https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80','available'),
 ('Shelly','turtle','Red-eared slider',3::numeric,'A calm turtle who needs a species-appropriate habitat and long-term care.','https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=900&q=80','available'),
 ('Clover','rabbit','Mini lop',1::numeric,'A gentle bunny who loves space to hop, hide and explore safely.','https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80','available'),
 ('Pip','hamster','Syrian hamster',1::numeric,'A tiny night-time adventurer who needs a spacious, enriched enclosure.','https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=900&q=80','available'),
 ('Mango','guinea pig','American guinea pig',2::numeric,'A sweet little veggie fan who thrives with companionship and daily care.','https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80','available')
) as v(name,species,breed,age,description,image_url,status)
where not exists (select 1 from public.pets p where p.name = v.name and p.species = v.species);
