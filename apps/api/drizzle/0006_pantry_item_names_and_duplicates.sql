ALTER TABLE "pantry_ingredients" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
DROP INDEX IF EXISTS "pantry_user_ingredient_unit_idx";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pantry_user_id_idx" ON "pantry_ingredients" USING btree ("user_id");
