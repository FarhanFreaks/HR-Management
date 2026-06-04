-- Payroll module schema for HRConnect.
-- Run this in Supabase SQL editor or via the Supabase CLI after reviewing against your existing schema.

create table if not exists public.payroll_settings (
  id integer primary key default 1 check (id = 1),
  paid_leave_allowed numeric(6,2) not null default 1,
  pf_percentage numeric(6,2) not null default 12,
  professional_tax_percentage numeric(6,2) not null default 2,
  health_insurance_percentage numeric(6,2) not null default 1,
  income_tax_percentage numeric(6,2) not null default 5,
  other_deduction_percentage numeric(6,2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.payroll_settings (
  id,
  paid_leave_allowed,
  pf_percentage,
  professional_tax_percentage,
  health_insurance_percentage,
  income_tax_percentage,
  other_deduction_percentage
)
values (1, 1, 12, 2, 1, 5, 0)
on conflict (id) do nothing;

create table if not exists public.payroll_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name text not null,
  department text,
  designation text,
  payroll_month integer not null check (payroll_month between 1 and 12),
  payroll_year integer not null check (payroll_year between 2000 and 2200),
  base_salary numeric(12,2) not null default 0,
  working_days integer not null default 0,
  present_days integer not null default 0,
  absent_days integer not null default 0,
  approved_leave_days numeric(8,2) not null default 0,
  paid_leave_allowed numeric(8,2) not null default 1,
  excess_leave_days numeric(8,2) not null default 0,
  per_day_salary numeric(12,2) not null default 0,
  leave_deduction numeric(12,2) not null default 0,
  absence_deduction numeric(12,2) not null default 0,
  pf_percentage numeric(6,2) not null default 0,
  pf_amount numeric(12,2) not null default 0,
  professional_tax_percentage numeric(6,2) not null default 0,
  professional_tax_amount numeric(12,2) not null default 0,
  insurance_percentage numeric(6,2) not null default 0,
  insurance_amount numeric(12,2) not null default 0,
  income_tax_percentage numeric(6,2) not null default 0,
  income_tax_amount numeric(12,2) not null default 0,
  other_deduction_percentage numeric(6,2) not null default 0,
  other_deduction_amount numeric(12,2) not null default 0,
  total_deductions numeric(12,2) not null default 0,
  gross_salary numeric(12,2) not null default 0,
  net_salary numeric(12,2) not null default 0,
  generated_at timestamptz not null default now(),
  generated_by uuid references auth.users(id),
  reviewed_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  sent_at timestamptz,
  sent_by uuid references auth.users(id),
  email_status text,
  delivery_status text,
  remarks text,
  status text not null default 'Generated'
    check (status in ('Draft', 'Generated', 'Reviewed', 'Approved', 'Rejected', 'Paid')),
  unique (employee_id, payroll_month, payroll_year)
);

create index if not exists payroll_records_month_year_idx
  on public.payroll_records (payroll_year desc, payroll_month desc);

create index if not exists payroll_records_employee_idx
  on public.payroll_records (employee_id);

create table if not exists public.payroll_email_logs (
  id uuid primary key default gen_random_uuid(),
  payroll_record_id uuid not null references public.payroll_records(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  sent_at timestamptz not null default now(),
  sent_by uuid references auth.users(id),
  email_status text not null default 'Queued',
  delivery_status text not null default 'Queued',
  provider_message_id text,
  error_message text
);

create or replace function public.is_hr_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and lower(profiles.role) = 'hr'
  );
$$;

alter table public.payroll_settings enable row level security;
alter table public.payroll_records enable row level security;
alter table public.payroll_email_logs enable row level security;

drop policy if exists "HR can manage payroll settings" on public.payroll_settings;
create policy "HR can manage payroll settings"
on public.payroll_settings
for all
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

drop policy if exists "HR can manage payroll records" on public.payroll_records;
create policy "HR can manage payroll records"
on public.payroll_records
for all
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

drop policy if exists "Employees can view own payroll records" on public.payroll_records;
create policy "Employees can view own payroll records"
on public.payroll_records
for select
to authenticated
using (employee_id = auth.uid());

drop policy if exists "HR can manage payroll email logs" on public.payroll_email_logs;
create policy "HR can manage payroll email logs"
on public.payroll_email_logs
for all
to authenticated
using (public.is_hr_user())
with check (public.is_hr_user());

drop policy if exists "Employees can view own payroll email logs" on public.payroll_email_logs;
create policy "Employees can view own payroll email logs"
on public.payroll_email_logs
for select
to authenticated
using (employee_id = auth.uid());
