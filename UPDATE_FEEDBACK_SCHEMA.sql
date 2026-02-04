-- ============================================
-- UPDATE FEEDBACKS SCHEMA (v2)
-- ============================================

-- 1. Add new columns for admin response
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- 2. Update RLS Policies to allow drivers to also insert feedback
DO $$ BEGIN
  -- Users (students/drivers) can insert their own feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own feedback') THEN
    CREATE POLICY "Users can insert own feedback" ON feedbacks
      FOR INSERT
      WITH CHECK (auth.uid()::text = student_id);
  END IF;

  -- Users can see their own feedback (and the admin response)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see own feedback response') THEN
    CREATE POLICY "Users can see own feedback response" ON feedbacks
      FOR SELECT
      USING (auth.uid()::text = student_id);
  END IF;
END $$;

-- Note: student_id column still references users(id). 
-- It is semantics; it can store Driver UUID as well.
