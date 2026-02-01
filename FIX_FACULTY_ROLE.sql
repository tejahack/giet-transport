-- ============================================
-- FIX: Add 'faculty' to allowed roles
-- ============================================
-- The users table has a check constraint that limits role values.
-- Run this to add 'faculty' as an allowed role.

-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new constraint with 'faculty' included
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'driver', 'student', 'faculty'));

-- ============================================
-- NOW YOU CAN ADD FACULTY USERS
-- ============================================
-- After running the above, you can insert faculty:

-- INSERT INTO users (id, email, name, role) VALUES
-- ('YOUR_FACULTY_UID', 'faculty@giet.edu', 'Dr. Faculty Name', 'faculty');
