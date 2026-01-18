-- Add location field to users
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "location" text;

