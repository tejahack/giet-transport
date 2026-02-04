-- ============================================
-- LIVE LOCATIONS TABLE (Real-time tracking)
-- ============================================
-- This table stores live coordinates for buses
-- Realtime should be enabled for this table in the Supabase Dashboard

CREATE TABLE IF NOT EXISTS live_locations (
  id TEXT PRIMARY KEY,                    -- Same as vehicle_id or vehicle_number
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  driver_name TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for admin map and student tracking)
CREATE POLICY "Allow public read access to live_locations" ON live_locations
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated drivers to insert/update their own vehicle location
-- Note: Simplified policy for initial build. Ideally restricted by vehicle-driver mapping.
CREATE POLICY "Drivers can update their live location" ON live_locations
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Add to Realtime
-- Execute this manually in Supabase SQL editor:
-- alter publication supabase_realtime add table live_locations;
