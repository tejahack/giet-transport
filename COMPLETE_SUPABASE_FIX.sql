-- ========================================================
-- CONSOLIDATED FIXES FOR GIET TRANSPORT ADMIN PORTAL
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- ========================================================

-- 1. FIX THE ROLES CONSTRAINT
-- Add 'faculty' to the allowed roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'faculty', 'driver', 'student'));

-- 2. ADD MISSING COLUMNS (If they don't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block TEXT;

-- 3. ADD ADMIN USER (Update with your UID)
-- This uses the UID from your console logs: 70842a11-674d-4d98-ac37-db72d816389a
INSERT INTO users (id, email, name, role) 
VALUES (
  '70842a11-674d-4d98-ac37-db72d816389a', 
  'mteja819@gmail.com', 
  'TEJA', 
  'admin'
) 
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 4. ADD SAMPLE FACULTY (Update with correct UID from Auth)
-- Using the UID from your error message: f07ce662-6625-4c0d-8621-1733d99e17ad
INSERT INTO users (id, email, name, role) 
VALUES (
  'f07ce662-6625-4c0d-8621-1733d99e17ad', 
  'faculty@giet.edu', 
  'Dr. Faculty Name', 
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET role = 'faculty';

-- VERIFY
SELECT * FROM users WHERE role IN ('admin', 'faculty');
