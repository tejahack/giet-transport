-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- This adds your Firebase account as an admin

-- Your Supabase UID from the console logs:
-- 70842a11-674d-4d98-ac37-db72d816389a

INSERT INTO users (id, email, name, role) 
VALUES (
  '70842a11-674d-4d98-ac37-db72d816389a',
  'mteja819@gmail.com',
  'TEJA',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- After running this, try logging in with Google again
-- You should be redirected to the dashboard!

-- To verify it worked, run this query:
-- SELECT * FROM users WHERE id = 'swwmkkScMTWkcj0SuIsbQCc6hZv2';
