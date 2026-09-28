ALTER TABLE "user_preferences" ALTER COLUMN "locale" SET DEFAULT 'ro-RO';
--> statement-breakpoint
UPDATE "user_preferences" SET "locale" = 'ro-RO' WHERE "locale" = 'en';
--> statement-breakpoint
INSERT INTO "user_preferences" ("user_id", "locale")
SELECT "id", 'ro-RO' FROM "user"
ON CONFLICT ("user_id") DO NOTHING;
