CREATE TYPE "user_role" AS ENUM('admin', 'regular');
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'regular' NOT NULL;
