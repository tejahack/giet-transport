-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- This adds your Firebase account as an admin

-- Your Firebase UID from the console logs:
-- swwmkkScMTWkcj0SuIsbQCc6hZv2

INSERT INTO users (id, email, name, role) 
VALUES (
  'swwmkkScMTWkcj0SuIsbQCc6hZv2',
  'mteja819@gmail.com',
  'TEJA',
  'admin'
);

-- After running this, try logging in with Google again
-- You should be redirected to the dashboard!

-- To verify it worked, run this query:
-- SELECT * FROM users WHERE id = 'swwmkkScMTWkcj0SuIsbQCc6hZv2';
