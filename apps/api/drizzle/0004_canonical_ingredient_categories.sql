CREATE TABLE IF NOT EXISTS "ingredient_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ingredient_categories_normalized_name_idx" ON "ingredient_categories" USING btree ("normalized_name");
--> statement-breakpoint
INSERT INTO "ingredient_categories" ("id", "name", "normalized_name") VALUES
  ('20000000-0000-4000-8000-000000000001', 'Bakery', 'bakery'),
  ('20000000-0000-4000-8000-000000000002', 'Beverage', 'beverage'),
  ('20000000-0000-4000-8000-000000000003', 'Canned Goods', 'canned goods'),
  ('20000000-0000-4000-8000-000000000004', 'Condiments', 'condiments'),
  ('20000000-0000-4000-8000-000000000005', 'Dairy', 'dairy'),
  ('20000000-0000-4000-8000-000000000006', 'Eggs', 'eggs'),
  ('20000000-0000-4000-8000-000000000007', 'Frozen', 'frozen'),
  ('20000000-0000-4000-8000-000000000008', 'Grains', 'grains'),
  ('20000000-0000-4000-8000-000000000009', 'Herbs', 'herbs'),
  ('20000000-0000-4000-8000-000000000010', 'Legumes', 'legumes'),
  ('20000000-0000-4000-8000-000000000011', 'Meat', 'meat'),
  ('20000000-0000-4000-8000-000000000012', 'Oils', 'oils'),
  ('20000000-0000-4000-8000-000000000013', 'Other', 'other'),
  ('20000000-0000-4000-8000-000000000014', 'Pasta', 'pasta'),
  ('20000000-0000-4000-8000-000000000015', 'Produce', 'produce'),
  ('20000000-0000-4000-8000-000000000016', 'Seafood', 'seafood'),
  ('20000000-0000-4000-8000-000000000017', 'Snacks', 'snacks'),
  ('20000000-0000-4000-8000-000000000018', 'Spices', 'spices')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "category_id" uuid;
--> statement-breakpoint
UPDATE "ingredients" AS ingredient
SET "category_id" = category."id"
FROM "ingredient_categories" AS category
WHERE category."normalized_name" = CASE
  WHEN lower(btrim(ingredient."category")) IN ('produce', 'vegetables', 'fruit') THEN 'produce'
  WHEN lower(btrim(ingredient."category")) IN ('pasta', 'pasta and grains') THEN 'pasta'
  WHEN lower(btrim(ingredient."category")) IN ('herbs', 'herbs and spices') THEN 'herbs'
  WHEN lower(btrim(ingredient."category")) IN ('oils', 'oils and vinegars') THEN 'oils'
  WHEN lower(btrim(ingredient."category")) = 'dairy and eggs'
    AND ingredient."normalized_name" ~ '(^| )eggs?( |$)' THEN 'eggs'
  WHEN lower(btrim(ingredient."category")) = 'dairy and eggs' THEN 'dairy'
  WHEN lower(btrim(ingredient."category")) IN ('beverage', 'beverages') THEN 'beverage'
  WHEN lower(btrim(ingredient."category")) IN ('meat', 'poultry') THEN 'meat'
  WHEN lower(btrim(ingredient."category")) = 'seafood' THEN 'seafood'
  WHEN lower(btrim(ingredient."category")) = 'spices' THEN 'spices'
  WHEN lower(btrim(ingredient."category")) IN ('condiments', 'sauces') THEN 'condiments'
  WHEN lower(btrim(ingredient."category")) IN ('bakery', 'bread') THEN 'bakery'
  WHEN lower(btrim(ingredient."category")) = 'grains' THEN 'grains'
  WHEN lower(btrim(ingredient."category")) IN ('legumes', 'beans') THEN 'legumes'
  WHEN lower(btrim(ingredient."category")) IN ('canned goods', 'canned') THEN 'canned goods'
  WHEN lower(btrim(ingredient."category")) = 'frozen' THEN 'frozen'
  WHEN lower(btrim(ingredient."category")) = 'snacks' THEN 'snacks'
  ELSE 'other'
END;
--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "category_id" SET NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingredients_category_id_ingredient_categories_id_fk'
  ) THEN
    ALTER TABLE "ingredients"
      ADD CONSTRAINT "ingredients_category_id_ingredient_categories_id_fk"
      FOREIGN KEY ("category_id") REFERENCES "public"."ingredient_categories"("id")
      ON DELETE restrict ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingredients_category_idx" ON "ingredients" USING btree ("category_id");
--> statement-breakpoint
ALTER TABLE "ingredients" DROP COLUMN IF EXISTS "category";