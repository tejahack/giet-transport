-- ========================================================
-- GIET TRANSPORT - FULL DATABASE SETUP (CONSOLIDATED)
-- ========================================================
-- This script creates the entire database structure, RLS policies, 
-- and initial admin/faculty users in one execution.

-- 1. CLEANUP (Optional - Uncomment if you want to start fresh)
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS alerts CASCADE;
-- DROP TABLE IF EXISTS student_routes CASCADE;
-- DROP TABLE IF EXISTS vehicles CASCADE;
-- DROP TABLE IF EXISTS routes CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'driver', 'student')),
  phone TEXT,
  license_no TEXT,
  photo_url TEXT,
  is_blocked BOOLEAN DEFAULT false,
  roll_number TEXT,
  branch TEXT,
  block TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. ROUTES TABLE
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  stops TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_routes_name ON routes(route_name);

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL UNIQUE,
  bus_name TEXT,
  capacity INTEGER,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_route ON vehicles(route_id);

-- 5. STUDENT ROUTES (Student-Route Assignment)
CREATE TABLE IF NOT EXISTS student_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  boarding_stop TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, route_id)
);

-- 6. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_route TEXT,
  sent_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('present', 'absent', 'late')) DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, route_id, date)
);

-- 8. LIVE LOCATIONS TABLE (For Real-time Tracking)
CREATE TABLE IF NOT EXISTS live_locations (
  id TEXT PRIMARY KEY,                    -- Usually matches vehicle_id or driver_id
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  driver_name TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to users') THEN
    CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to routes') THEN
    CREATE POLICY "Allow public read access to routes" ON routes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to vehicles') THEN
    CREATE POLICY "Allow public read access to vehicles" ON vehicles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to alerts') THEN
    CREATE POLICY "Allow public read access to alerts" ON alerts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to live_locations') THEN
    CREATE POLICY "Allow public read access to live_locations" ON live_locations FOR SELECT USING (true);
  END IF;
END $$;


-- 9. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, NOW());
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. INITIAL USERS
INSERT INTO users (id, email, name, role) 
VALUES (
  '70842a11-674d-4d98-ac37-db72d816389a', 
  'mteja819@gmail.com', 
  'TEJA', 
  'admin'
) 
ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'TEJA';

INSERT INTO users (id, email, name, role) 
VALUES (
  'f07ce662-6625-4c0d-8621-1733d99e17ad', 
  'faculty@giet.edu', 
  'Dr. Faculty Name', 
  'faculty'
)
ON CONFLICT (id) DO UPDATE SET role = 'faculty';

-- 11. ENABLE REALTIME
-- This is crucial for Live Tracking!
ALTER PUBLICATION supabase_realtime ADD TABLE live_locations;

-- 12. VERIFICATION
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT * FROM users WHERE role IN ('admin', 'faculty');

