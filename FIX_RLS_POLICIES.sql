-- ============================================
-- FIX: Add INSERT/UPDATE/DELETE Policies for Supabase RLS
-- ============================================
-- Run this in your Supabase SQL Editor to fix the 401 errors.
-- Your current schema only allows SELECT (read) operations.
-- This script adds policies to allow write operations.

-- ============================================
-- OPTION 1: ALLOW ALL OPERATIONS (For Development)
-- ============================================
-- This is the quickest fix for development. 
-- For production, you should use service_role key or more restrictive policies.

-- ROUTES TABLE: Allow all operations
CREATE POLICY "Allow public insert on routes" ON routes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on routes" ON routes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on routes" ON routes
  FOR DELETE USING (true);

-- USERS TABLE: Allow all operations
CREATE POLICY "Allow public insert on users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on users" ON users
  FOR DELETE USING (true);

-- VEHICLES TABLE: Allow all operations
CREATE POLICY "Allow public insert on vehicles" ON vehicles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on vehicles" ON vehicles
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on vehicles" ON vehicles
  FOR DELETE USING (true);

-- ALERTS TABLE: Allow all operations
CREATE POLICY "Allow public insert on alerts" ON alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on alerts" ON alerts
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on alerts" ON alerts
  FOR DELETE USING (true);

-- STUDENT_ROUTES TABLE: Allow all operations
CREATE POLICY "Allow public insert on student_routes" ON student_routes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on student_routes" ON student_routes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on student_routes" ON student_routes
  FOR DELETE USING (true);

-- ATTENDANCE TABLE: Allow all operations
CREATE POLICY "Allow public insert on attendance" ON attendance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on attendance" ON attendance
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on attendance" ON attendance
  FOR DELETE USING (true);

-- ============================================
-- VERIFICATION: Check your policies
-- ============================================
-- Run this to verify all policies are in place:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
