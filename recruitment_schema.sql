-- Drop existing tables if re-running
DROP TABLE IF EXISTS public.job_openings CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;

-- Create Job Openings Table
CREATE TABLE public.job_openings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    job_type TEXT,
    work_mode TEXT,
    openings INT DEFAULT 1,
    description TEXT,
    responsibilities TEXT[],
    skills TEXT[],
    experience TEXT,
    education TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    currency TEXT,
    deadline DATE,
    joining_date DATE,
    priority TEXT,
    hiring_manager TEXT,
    contact_email TEXT,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Active',
    applicants INT DEFAULT 0
);

-- Create Candidates Table
CREATE TABLE public.candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    applied_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Screening',
    rating INT DEFAULT 0,
    email TEXT,
    phone TEXT,
    experience TEXT,
    education TEXT,
    skills TEXT[],
    source TEXT,
    resume_url TEXT,
    interview JSONB
);

-- Open Policies for Testing
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all job_openings" ON public.job_openings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all candidates" ON public.candidates FOR ALL USING (true) WITH CHECK (true);
