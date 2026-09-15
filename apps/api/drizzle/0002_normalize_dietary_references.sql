
CREATE TABLE "diet_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "diet_types_normalized_name_idx" ON "diet_types" USING btree ("normalized_name");
--> statement-breakpoint
CREATE TABLE "recipe_diet_types" (
  "recipe_id" uuid NOT NULL,
  "diet_type_id" uuid NOT NULL,
  CONSTRAINT "recipe_diet_types_recipe_id_diet_type_id_pk" PRIMARY KEY("recipe_id", "diet_type_id")
);
--> statement-breakpoint
ALTER TABLE "recipe_diet_types" ADD CONSTRAINT "recipe_diet_types_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recipe_diet_types" ADD CONSTRAINT "recipe_diet_types_diet_type_id_diet_types_id_fk" FOREIGN KEY ("diet_type_id") REFERENCES "public"."diet_types"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "recipe_diet_types_diet_type_idx" ON "recipe_diet_types" USING btree ("diet_type_id");
--> statement-breakpoint
CREATE TABLE "user_preferred_diet_types" (
  "user_id" text NOT NULL,
  "diet_type_id" uuid NOT NULL,
  CONSTRAINT "user_preferred_diet_types_user_id_diet_type_id_pk" PRIMARY KEY("user_id", "diet_type_id")
);
--> statement-breakpoint
ALTER TABLE "user_preferred_diet_types" ADD CONSTRAINT "user_preferred_diet_types_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_preferred_diet_types" ADD CONSTRAINT "user_preferred_diet_types_diet_type_id_diet_types_id_fk" FOREIGN KEY ("diet_type_id") REFERENCES "public"."diet_types"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "user_allergic_ingredients" (
  "user_id" text NOT NULL,
  "ingredient_id" uuid NOT NULL,
  CONSTRAINT "user_allergic_ingredients_user_id_ingredient_id_pk" PRIMARY KEY("user_id", "ingredient_id")
);
--> statement-breakpoint
ALTER TABLE "user_allergic_ingredients" ADD CONSTRAINT "user_allergic_ingredients_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_allergic_ingredients" ADD CONSTRAINT "user_allergic_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "user_disliked_ingredients" (
  "user_id" text NOT NULL,
  "ingredient_id" uuid NOT NULL,
  CONSTRAINT "user_disliked_ingredients_user_id_ingredient_id_pk" PRIMARY KEY("user_id", "ingredient_id")
);
--> statement-breakpoint
ALTER TABLE "user_disliked_ingredients" ADD CONSTRAINT "user_disliked_ingredients_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_disliked_ingredients" ADD CONSTRAINT "user_disliked_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "diet_types" ("id", "name", "normalized_name") VALUES
  ('30000000-0000-4000-8000-000000000001', 'Vegetarian', 'vegetarian'),
  ('30000000-0000-4000-8000-000000000002', 'Vegan', 'vegan'),
  ('30000000-0000-4000-8000-000000000003', 'Omnivore', 'omnivore'),
  ('30000000-0000-4000-8000-000000000004', 'Pescatarian', 'pescatarian')
ON CONFLICT ("normalized_name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "diet_types" ("name", "normalized_name")
SELECT DISTINCT btrim(preference.value), lower(btrim(preference.value))
FROM "user_preferences"
CROSS JOIN LATERAL jsonb_array_elements_text("dietary" -> 'diets') AS preference(value)
WHERE btrim(preference.value) <> ''
ON CONFLICT ("normalized_name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "ingredients" ("name", "normalized_name", "default_unit")
SELECT DISTINCT legacy.name, lower(legacy.name), 'unit'
FROM (
  SELECT btrim(allergen.value) AS name
  FROM "user_preferences"
  CROSS JOIN LATERAL jsonb_array_elements_text("dietary" -> 'allergens') AS allergen(value)
  UNION
  SELECT btrim(disliked.value) AS name
  FROM "user_preferences"
  CROSS JOIN LATERAL jsonb_array_elements_text("dietary" -> 'dislikedIngredients') AS disliked(value)
) AS legacy
WHERE legacy.name <> ''
ON CONFLICT ("normalized_name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "recipe_diet_types" ("recipe_id", "diet_type_id")
SELECT recipe."id", diet_type."id"
FROM "recipes" AS recipe
CROSS JOIN LATERAL jsonb_array_elements_text(recipe."tags") AS tag(value)
INNER JOIN "diet_types" AS diet_type
  ON diet_type."normalized_name" = lower(btrim(tag.value))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "user_preferred_diet_types" ("user_id", "diet_type_id")
SELECT preference."user_id", diet_type."id"
FROM "user_preferences" AS preference
CROSS JOIN LATERAL jsonb_array_elements_text(preference."dietary" -> 'diets') AS diet(value)
INNER JOIN "diet_types" AS diet_type
  ON diet_type."normalized_name" = lower(btrim(diet.value))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "user_allergic_ingredients" ("user_id", "ingredient_id")
SELECT preference."user_id", ingredient."id"
FROM "user_preferences" AS preference
CROSS JOIN LATERAL jsonb_array_elements_text(preference."dietary" -> 'allergens') AS allergen(value)
INNER JOIN "ingredients" AS ingredient
  ON ingredient."normalized_name" = lower(btrim(allergen.value))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "user_disliked_ingredients" ("user_id", "ingredient_id")
SELECT preference."user_id", ingredient."id"
FROM "user_preferences" AS preference
CROSS JOIN LATERAL jsonb_array_elements_text(preference."dietary" -> 'dislikedIngredients') AS disliked(value)
INNER JOIN "ingredients" AS ingredient
  ON ingredient."normalized_name" = lower(btrim(disliked.value))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "user_preferences" DROP COLUMN "dietary";