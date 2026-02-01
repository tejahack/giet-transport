-- ============================================
-- ADD BLOCK AND BRANCH COLUMNS TO USERS TABLE
-- ============================================
-- Run this in your Supabase SQL Editor to add the new columns

-- Add branch column (department/major)
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch TEXT;

-- Add block column (hostel block)
ALTER TABLE users ADD COLUMN IF NOT EXISTS block TEXT;

-- ============================================
-- VERIFY THE COLUMNS EXIST
-- ============================================
-- Run this query to verify:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users';

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================
-- Example of updating existing students with block/branch:

-- UPDATE users SET 
--   branch = 'CSE - Computer Science Engineering',
--   block = 'Block A - Boys Hostel'
-- WHERE role = 'student' AND roll_number = '21BE...XXXX';
