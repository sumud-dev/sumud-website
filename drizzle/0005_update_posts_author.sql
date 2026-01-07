-- Migration: Update posts table to use authorId referencing users table
-- This replaces the text 'author' column with 'author_id' varchar referencing users

-- Step 1: Add the new author_id column
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "author_id" varchar(255);

-- Step 2: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'posts_author_id_users_id_fk'
    ) THEN
        ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" 
        FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;

-- Step 3: Drop the old author column if it exists
ALTER TABLE "posts" DROP COLUMN IF EXISTS "author";
