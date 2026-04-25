-- ===========================
-- LeadFlow CRM Database Schema
-- Run this in Supabase SQL Editor
-- ===========================

-- 1. Leads table
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null default '',
  service text not null default 'תסרוקת',
  stage text not null default 'new',
  source text not null default 'whatsapp',
  appointment_date text,
  follow_up_date text,
  reminder_at text,
  notes text,
  referred_by text,
  amount_paid numeric,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Appointment records (service history)
create table if not exists public.appointment_records (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  service text not null,
  amount numeric not null default 0,
  notes text,
  created_at timestamptz default now() not null
);

-- 3. Row Level Security
alter table public.leads enable row level security;
alter table public.appointment_records enable row level security;

-- Leads: users can only see/manage their own leads
create policy "Users can view their own leads"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "Users can insert their own leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own leads"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "Users can delete their own leads"
  on public.leads for delete
  using (auth.uid() = user_id);

-- Appointment records: same RLS pattern
create policy "Users can view their own appointment records"
  on public.appointment_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own appointment records"
  on public.appointment_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own appointment records"
  on public.appointment_records for update
  using (auth.uid() = user_id);

create policy "Users can delete their own appointment records"
  on public.appointment_records for delete
  using (auth.uid() = user_id);

-- 4. Indexes for performance
create index if not exists idx_leads_user_id on public.leads(user_id);
create index if not exists idx_leads_stage on public.leads(stage);
create index if not exists idx_leads_reminder_at on public.leads(reminder_at);
create index if not exists idx_appointment_records_lead_id on public.appointment_records(lead_id);
create index if not exists idx_appointment_records_user_id on public.appointment_records(user_id);

-- 5. Auto-update updated_at on leads
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_lead_updated
  before update on public.leads
  for each row execute function public.handle_updated_at();
