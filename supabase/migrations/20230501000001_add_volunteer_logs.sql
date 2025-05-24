-- Create volunteer_logs table to track volunteer hours
CREATE TABLE IF NOT EXISTS volunteer_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
  hours NUMERIC(5, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS volunteer_logs_user_id_idx ON volunteer_logs (user_id);
CREATE INDEX IF NOT EXISTS volunteer_logs_opportunity_id_idx ON volunteer_logs (opportunity_id);
CREATE INDEX IF NOT EXISTS volunteer_logs_date_idx ON volunteer_logs (date);
CREATE INDEX IF NOT EXISTS volunteer_logs_status_idx ON volunteer_logs (status);

-- Add RLS policies
ALTER TABLE volunteer_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own volunteer logs"
  ON volunteer_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert their own volunteer logs"
  ON volunteer_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own logs
CREATE POLICY "Users can update their own volunteer logs"
  ON volunteer_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own logs
CREATE POLICY "Users can delete their own volunteer logs"
  ON volunteer_logs FOR DELETE
  USING (auth.uid() = user_id);
