CREATE TABLE IF NOT EXISTS rsvps (
  id text PRIMARY KEY,
  name text NOT NULL,
  attendance text NOT NULL CHECK (attendance IN ('yes', 'no')),
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
