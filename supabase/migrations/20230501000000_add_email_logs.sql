-- Create email_logs table to track email sending
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  data JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS email_logs_recipient_idx ON email_logs (recipient);
CREATE INDEX IF NOT EXISTS email_logs_template_idx ON email_logs (template);
CREATE INDEX IF NOT EXISTS email_logs_status_idx ON email_logs (status);
