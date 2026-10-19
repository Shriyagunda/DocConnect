-- MediConnect initial schema (MongoDB/Mongoose -> Supabase PostgreSQL)
-- Repeatable: uses IF NOT EXISTS. Does not DROP tables or delete rows.
--
-- ID strategy:
--   MongoDB used ObjectId strings for users, doctors, appointments, JWTs,
--   userId, and docId. Columns are TEXT so existing ObjectId values can be
--   preserved during data migration, and new rows use gen_random_uuid()::text.
--
-- Relationships:
--   No FOREIGN KEY constraints. The original app stored userId/docId as
--   strings plus embedded userData/docData snapshots, without populate/joins.
--
-- Access control:
--   All application queries go through the Express backend using the
--   Supabase service role key (bypasses RLS). RLS is enabled with no
--   policies for anon/authenticated so the public API cannot read these tables.
--   Do not put SUPABASE_SERVICE_ROLE_KEY in frontend/Vite env vars.
--
-- How to run:
--   Supabase Dashboard -> SQL Editor -> paste this file -> Run
--   or: supabase db push (if the CLI is linked to this project)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  image TEXT,
  phone TEXT DEFAULT '000000000',
  address JSONB DEFAULT '{"line1":"","line2":""}'::jsonb,
  gender TEXT DEFAULT 'Not Selected',
  dob TEXT DEFAULT 'Not Selected',
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  image TEXT NOT NULL,
  speciality TEXT NOT NULL,
  degree TEXT NOT NULL,
  experience TEXT NOT NULL,
  about TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  fees NUMERIC NOT NULL,
  slots_booked JSONB NOT NULL DEFAULT '{}'::jsonb,
  address JSONB NOT NULL,
  date BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "docId" TEXT NOT NULL,
  "slotDate" TEXT NOT NULL,
  "slotTime" TEXT NOT NULL,
  "userData" JSONB NOT NULL,
  "docData" JSONB NOT NULL,
  amount NUMERIC NOT NULL,
  date BIGINT NOT NULL,
  cancelled BOOLEAN NOT NULL DEFAULT false,
  payment BOOLEAN NOT NULL DEFAULT false,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors (email);
CREATE INDEX IF NOT EXISTS idx_appointments_userId ON appointments ("userId");
CREATE INDEX IF NOT EXISTS idx_appointments_docId ON appointments ("docId");
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies for anon or authenticated roles.
-- Service role (Express backend) bypasses RLS and remains the only accessor.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE users FROM anon;
    REVOKE ALL ON TABLE doctors FROM anon;
    REVOKE ALL ON TABLE appointments FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE users FROM authenticated;
    REVOKE ALL ON TABLE doctors FROM authenticated;
    REVOKE ALL ON TABLE appointments FROM authenticated;
  END IF;
END $$;
