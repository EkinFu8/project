-- Initial schema setup

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- employee table

CREATE TABLE employee (
    employeeID CHAR(10) PRIMARY KEY,
    employee_name VARCHAR(50),
    job_desc VARCHAR(200)
);

-- content management table

CREATE TABLE content_management (
    fileID CHAR(64) PRIMARY KEY,
    filename VARCHAR(100),
    url VARCHAR(100),
    content_owner VARCHAR(50),
    job_position VARCHAR(20),
    last_modified DATE,
    expiration_date DATE,
    content_type VARCHAR(20),
    document_status VARCHAR(20),
    FOREIGN KEY (content_owner) REFERENCES employee(employeeID)
);