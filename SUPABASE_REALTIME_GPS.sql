-- ============================================
-- ADDITIONAL TABLE: Live Locations for GPS Tracking
-- ============================================
-- Run this in your Supabase SQL Editor to enable real-time GPS tracking
-- This replaces Firebase Realtime Database

-- Create the live_locations table
CREATE TABLE IF NOT EXISTS live_locations (
    id TEXT PRIMARY KEY,                    -- Bus/Vehicle identifier
    lat DOUBLE PRECISION NOT NULL,          -- Latitude
    lng DOUBLE PRECISION NOT NULL,          -- Longitude
    speed DOUBLE PRECISION DEFAULT 0,       -- Speed in km/h
    driver_name TEXT,                       -- Driver name
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for dashboard/map viewing)
CREATE POLICY "Allow public read on live_locations" ON live_locations
    FOR SELECT USING (true);

-- Allow public write access (for driver apps to update location)
CREATE POLICY "Allow public insert on live_locations" ON live_locations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on live_locations" ON live_locations
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on live_locations" ON live_locations
    FOR DELETE USING (true);

-- Enable Realtime for this table (IMPORTANT!)
-- Go to Supabase Dashboard > Database > Replication > Enable for live_locations table

-- ============================================
-- TEST DATA (Optional)
-- ============================================
-- Insert a test bus location to verify the map works:

-- INSERT INTO live_locations (id, lat, lng, speed, driver_name) 
-- VALUES ('BUS_001', 16.9744, 82.2355, 45, 'Raju Kumar');

-- ============================================
-- CREATE ADMIN USER IN SUPABASE AUTH
-- ============================================
-- You need to create an admin user manually in Supabase:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create New User"
-- 3. Enter email: admin@giet.edu, password: Admin@123
-- 4. After creation, copy the user's UID
-- 5. Insert the admin into the users table:

-- INSERT INTO users (id, email, name, role) VALUES
-- ('PASTE_SUPABASE_USER_UID_HERE', 'admin@giet.edu', 'GIET Admin', 'admin');
