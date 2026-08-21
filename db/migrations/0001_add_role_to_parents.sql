ALTER TABLE parents ADD COLUMN role TEXT NOT NULL DEFAULT 'client'
  CHECK (role IN ('client', 'instructor', 'admin'));
