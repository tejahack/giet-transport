-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE ROLE CONSTRAINT
-- This allows the 'faculty' role to be added to the users table

-- 1. Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add the new constraint with 'faculty' included
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'faculty', 'driver', 'student'));

-- 3. Now retry your faculty insert:
-- INSERT INTO users (id, email, name, role) VALUES
-- ('f07ce662-6625-4c0d-8621-1733d99e17ad', 'faculty@giet.edu', 'Dr. Faculty Name', 'faculty');
