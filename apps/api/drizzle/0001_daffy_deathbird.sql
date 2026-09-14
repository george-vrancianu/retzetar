CREATE TYPE "public"."cart_status" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."cart_status";--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "status" SET DATA TYPE "public"."cart_status" USING "status"::"public"."cart_status";