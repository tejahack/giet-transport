-- ============================================
-- GIET TRANSPORT ADMIN PORTAL - SUPABASE SQL SCHEMA
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- This will create all necessary tables for the transport management system

-- ============================================
-- 1. USERS TABLE (Admin, Drivers, Students)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- Firebase UID (must match Firebase Auth UID)
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'driver', 'student')),
  phone TEXT,
  license_no TEXT,                        -- Only for drivers
  photo_url TEXT,                         -- Google profile photo or uploaded photo
  is_blocked BOOLEAN DEFAULT false,       -- Only used for students
  roll_number TEXT,                       -- Only for students
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. ROUTES TABLE (Bus Routes with Stops)
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  stops TEXT[] NOT NULL,                  -- Array of stop names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index for route searches
CREATE INDEX IF NOT EXISTS idx_routes_name ON routes(route_name);

-- ============================================
-- 3. VEHICLES TABLE (Buses)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL UNIQUE,    -- License plate number
  bus_name TEXT,                          -- Friendly name like "Bus A1"
  capacity INTEGER,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_route ON vehicles(route_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- ============================================
-- 4. STUDENT ROUTES (Student-Route Assignment)
-- ============================================
CREATE TABLE IF NOT EXISTS student_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  boarding_stop TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, route_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_student_routes_student ON student_routes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_routes_route ON student_routes(route_id);

-- ============================================
-- 5. ALERTS TABLE (Notifications/Announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_route TEXT,                      -- "all" for all routes, or specific route_id
  sent_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index for alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_target_route ON alerts(target_route);

-- ============================================
-- 6. ATTENDANCE TABLE (Optional: Track student attendance)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('present', 'absent', 'late')) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, route_id, date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);

-- ============================================
-- SAMPLE DATA (IMPORTANT: Add your admin account)
-- ============================================

-- Step 1: Add yourself as an admin
-- REPLACE 'YOUR_FIREBASE_UID' with your actual Firebase UID from the console log
-- REPLACE 'your_email@example.com' with your actual email

-- INSERT INTO users (id, email, name, role, photo_url) 
-- VALUES (
--   'YOUR_FIREBASE_UID_HERE',           -- Get this from browser console after Google login
--   'your_email@gmail.com',              -- Your email
--   'Your Name',                         -- Your name
--   'admin',                             -- MUST be 'admin'
--   'https://your-photo-url.com'         -- Optional: Your photo URL
-- );

-- Step 2: (Optional) Add sample routes for testing
-- Uncomment to add sample data:

-- INSERT INTO routes (route_name, stops) VALUES
-- ('Route 1 - Main Campus', ARRAY['GIET Main Gate', 'Library Junction', 'Engineering Block', 'Hostel Area']),
-- ('Route 2 - City Center', ARRAY['City Center', 'Shopping Mall', 'Railway Station', 'GIET Gate']),
-- ('Route 3 - Residential', ARRAY['Phase 1', 'Phase 2', 'Phase 3', 'Main Road', 'GIET']);

-- Step 3: (Optional) Add sample driver for testing
-- INSERT INTO users (id, email, name, role, phone, license_no) VALUES
-- ('sample_driver_uid', 'driver@giet.edu', 'Raju Kumar', 'driver', '+91-9876543210', 'AP12AB1234');

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables for security

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to users table (needed for role checks)
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Policy: Allow public access to routes (for students to view)
CREATE POLICY "Allow public read access to routes" ON routes
  FOR SELECT
  USING (true);

-- Policy: Allow public read access to vehicles
CREATE POLICY "Allow public read access to vehicles" ON vehicles
  FOR SELECT
  USING (true);

-- Policy: Allow public read access to alerts
CREATE POLICY "Allow public read access to alerts" ON alerts
  FOR SELECT
  USING (true);

-- Note: For admin operations (INSERT, UPDATE, DELETE), 
-- you'll need to handle this in your application logic or create service role keys

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, NOW());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on routes table
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after the schema creation to verify everything works

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Count records in each table
-- SELECT 'users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'routes', COUNT(*) FROM routes
-- UNION ALL
-- SELECT 'vehicles', COUNT(*) FROM vehicles
-- UNION ALL
-- SELECT 'alerts', COUNT(*) FROM alerts;

-- ============================================
-- ADD BLOCK AND BRANCH COLUMNS (For Students)
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block TEXT;

-- ============================================
-- USER ROLES REFERENCE
-- ============================================
-- Available roles in the system:
--   'admin'   - Full access to all features
--   'faculty' - Can only add/view students
--   'driver'  - Driver account (mobile app)
--   'student' - Student account (mobile app)

-- ============================================
-- ADD FACULTY USER
-- ============================================
-- Step 1: Create user in Supabase Authentication
--         Go to: Dashboard > Authentication > Users > Add User
--         Email: faculty@giet.edu, Password: Faculty@123

-- Step 2: Copy the UID and replace below, then run:
INSERT INTO users (id, email, name, role) VALUES
('PASTE_FACULTY_UID_HERE', 'faculty@giet.edu', 'Dr. Faculty Name', 'faculty');

-- ============================================
-- ADD ADMIN USER (Uncomment and run after creating in Auth)
-- ============================================
INSERT INTO users (id, email, name, role) VALUES
('PASTE_ADMIN_UID_HERE', 'admin@giet.edu', 'GIET Admin', 'admin');


-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next Steps:
-- 1. Create admin user in Supabase Authentication
-- 2. Run the INSERT statement with the UID
-- 3. Create faculty user if needed
-- 4. Login and start managing the system!
