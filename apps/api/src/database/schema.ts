import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

export const userRole = pgEnum('user_role', ['admin', 'regular']);

// Better Auth core tables. User IDs intentionally remain text because Better Auth owns them.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: userRole('role').notNull().default('regular'),
  ...timestamps,
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    uniqueIndex('account_provider_account_idx').on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    displayName: text('display_name'),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    ...timestamps,
  },
  (table) => [uniqueIndex('user_profiles_user_id_idx').on(table.userId)],
);

export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull().default('en'),
  ...timestamps,
});

export const dietTypes = pgTable(
  'diet_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('diet_types_normalized_name_idx').on(table.normalizedName),
  ],
);

export const ingredientCategories = pgTable(
  'ingredient_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('ingredient_categories_normalized_name_idx').on(
      table.normalizedName,
    ),
  ],
);

export const ingredients = pgTable(
  'ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    defaultUnit: text('default_unit').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => ingredientCategories.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('ingredients_normalized_name_idx').on(table.normalizedName),
    index('ingredients_category_idx').on(table.categoryId),
  ],
);

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    imageUrl: text('image_url'),
    servings: integer('servings').notNull().default(1),
    prepMinutes: integer('prep_minutes').notNull().default(0),
    cookMinutes: integer('cook_minutes').notNull().default(0),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    published: boolean('published').notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('recipes_slug_idx').on(table.slug),
    index('recipes_title_idx').on(table.title),
  ],
);

export const recipeDietTypes = pgTable(
  'recipe_diet_types',
  {
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    dietTypeId: uuid('diet_type_id')
      .notNull()
      .references(() => dietTypes.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.recipeId, table.dietTypeId] }),
    index('recipe_diet_types_diet_type_idx').on(table.dietTypeId),
  ],
);

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    quantity: doublePrecision('quantity').notNull(),
    unit: text('unit').notNull(),
    note: text('note'),
    position: integer('position').notNull(),
  },
  (table) => [
    uniqueIndex('recipe_ingredients_position_idx').on(
      table.recipeId,
      table.position,
    ),
    index('recipe_ingredients_ingredient_idx').on(table.ingredientId),
  ],
);

export const recipeSteps = pgTable(
  'recipe_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    instruction: text('instruction').notNull(),
    durationMinutes: integer('duration_minutes'),
  },
  (table) => [
    uniqueIndex('recipe_steps_position_idx').on(table.recipeId, table.position),
  ],
);

export const userPreferredDietTypes = pgTable(
  'user_preferred_diet_types',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    dietTypeId: uuid('diet_type_id')
      .notNull()
      .references(() => dietTypes.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.dietTypeId] })],
);

export const userAllergicIngredients = pgTable(
  'user_allergic_ingredients',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.ingredientId] })],
);

export const userDislikedIngredients = pgTable(
  'user_disliked_ingredients',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.ingredientId] })],
);

export const pantryIngredients = pgTable(
  'pantry_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    quantity: doublePrecision('quantity').notNull(),
    unit: text('unit').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('pantry_user_ingredient_unit_idx').on(
      table.userId,
      table.ingredientId,
      table.unit,
    ),
  ],
);

export const favoriteRecipes = pgTable(
  'favorite_recipes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.recipeId] })],
);

export type WidgetSettings = Record<string, string | number | boolean>;

export const dashboardWidgets = pgTable(
  'dashboard_widgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    position: integer('position').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    settings: jsonb('settings').$type<WidgetSettings>().notNull().default({}),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('dashboard_widgets_position_idx').on(
      table.userId,
      table.position,
    ),
  ],
);

export const cartStatus = pgEnum('cart_status', [
  'active',
  'completed',
  'archived',
]);

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    status: cartStatus('status').notNull().default('active'),
    ...timestamps,
  },
  (table) => [index('carts_user_id_idx').on(table.userId)],
);

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    quantity: doublePrecision('quantity').notNull(),
    unit: text('unit').notNull(),
    checked: boolean('checked').notNull().default(false),
    sourceRecipeId: uuid('source_recipe_id').references(() => recipes.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('cart_items_cart_ingredient_unit_idx').on(
      table.cartId,
      table.ingredientId,
      table.unit,
    ),
  ],
);
