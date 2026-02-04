-- ============================================
-- CREATE FEEDBACKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_student ON feedbacks(student_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- Enable RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  -- Students can insert their own feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own feedback') THEN
    CREATE POLICY "Students can insert own feedback" ON feedbacks
      FOR INSERT
      WITH CHECK (auth.uid()::text = student_id);
  END IF;

  -- Admins can read all feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all feedback') THEN
    CREATE POLICY "Admins can read all feedback" ON feedbacks
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
      ));
  END IF;

  -- Admins can update feedback (e.g., mark as resolved)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update feedback') THEN
    CREATE POLICY "Admins can update feedback" ON feedbacks
      FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
      ));
  END IF;
END $$;
