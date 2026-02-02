-- ============================================
-- ADD FACULTY USER
-- ============================================
-- Run this in your Supabase SQL Editor after creating 
-- a faculty user in Supabase Authentication.

-- STEP 1: Go to Supabase Dashboard > Authentication > Users
-- STEP 2: Click "Add User" > "Create New User"
-- STEP 3: Enter faculty email and password, e.g.:
--         Email: faculty@giet.edu
--         Password: Faculty@123
-- STEP 4: Copy the user's UID after creation
-- STEP 5: Run this SQL with the UID:

-- Example: Replace the UID with your actual faculty user UID
INSERT INTO users (id, email, name, role) VALUES
('PASTE_FACULTY_UID_HERE', 'faculty@giet.edu', 'Faculty Member', 'faculty');

-- ============================================
-- FACULTY PERMISSIONS
-- ============================================
-- Faculty users can:
--   ✅ View Dashboard (limited stats)
--   ✅ View Student List
--   ✅ Add New Students
--
-- Faculty users CANNOT:
--   ❌ Access Live Tracking
--   ❌ Manage Drivers
--   ❌ Manage Routes
--   ❌ Send Mass Alerts

-- ============================================
-- ADD MULTIPLE FACULTY MEMBERS
-- ============================================
-- To add more faculty, repeat the process above or use batch insert:

-- INSERT INTO users (id, email, name, role) VALUES
-- ('UID_1', 'faculty1@giet.edu', 'Dr. Ramesh Kumar', 'faculty'),
-- ('UID_2', 'faculty2@giet.edu', 'Dr. Priya Sharma', 'faculty'),
-- ('UID_3', 'faculty3@giet.edu', 'Prof. Suresh Reddy', 'faculty');
