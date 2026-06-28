-- ============================================================
-- PeoplePost: Supabase Setup SQL Script
-- Run this in your Supabase SQL Editor (once only)
-- ============================================================

-- STEP 1: Create the upvotes table
CREATE TABLE IF NOT EXISTS public.upvotes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id   uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (report_id, user_id)
);

-- STEP 2: Create reassignment_logs table (if it does not exist)
CREATE TABLE IF NOT EXISTS public.reassignment_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id     uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  official_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_category  text NOT NULL,
  new_category  text NOT NULL,
  reason        text,
  created_at    timestamptz DEFAULT now()
);

-- STEP 3: Enable Row Level Security on all tables
ALTER TABLE public.reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reassignment_logs  ENABLE ROW LEVEL SECURITY;

-- STEP 4: RLS Policies — reports
CREATE POLICY "reports: public read"
  ON public.reports FOR SELECT USING (true);

CREATE POLICY "reports: citizen insert own"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "reports: update own or official"
  ON public.reports FOR UPDATE
  USING (
    auth.uid() = "userId"
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'official')
  );

-- STEP 5: RLS Policies — users
CREATE POLICY "users: authenticated read"
  ON public.users FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "users: insert own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: update own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- STEP 6: RLS Policies — upvotes
CREATE POLICY "upvotes: public read"
  ON public.upvotes FOR SELECT USING (true);

CREATE POLICY "upvotes: insert own"
  ON public.upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "upvotes: delete own"
  ON public.upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- STEP 7: RLS Policies — reassignment_logs
CREATE POLICY "logs: official read"
  ON public.reassignment_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'official'));

CREATE POLICY "logs: official insert"
  ON public.reassignment_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'official'));

-- Verify: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- STEP 8: Enable Realtime for reports table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
