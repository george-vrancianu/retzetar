import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  dietTypes,
  ingredients,
  recipeDietTypes,
  recipeIngredients,
  recipes,
  recipeSteps,
} from './schema';

const ingredientRows = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Spaghetti',
    normalizedName: 'spaghetti',
    defaultUnit: 'g',
    category: 'Pasta',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Tomato',
    normalizedName: 'tomato',
    defaultUnit: 'g',
    category: 'Produce',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Garlic',
    normalizedName: 'garlic',
    defaultUnit: 'clove',
    category: 'Produce',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Olive oil',
    normalizedName: 'olive oil',
    defaultUnit: 'tbsp',
    category: 'Oils',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Fresh basil',
    normalizedName: 'fresh basil',
    defaultUnit: 'g',
    category: 'Herbs',
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Egg',
    normalizedName: 'egg',
    defaultUnit: 'piece',
    category: 'Dairy and eggs',
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Parmesan',
    normalizedName: 'parmesan',
    defaultUnit: 'g',
    category: 'Dairy and eggs',
  },
] as const;

const dietTypeRows = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    name: 'Vegetarian',
    normalizedName: 'vegetarian',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    name: 'Vegan',
    normalizedName: 'vegan',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    name: 'Omnivore',
    normalizedName: 'omnivore',
  },
  {
    id: '30000000-0000-4000-8000-000000000004',
    name: 'Pescatarian',
    normalizedName: 'pescatarian',
  },
] as const;

const recipeRows: Array<typeof recipes.$inferInsert & { id: string }> = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    slug: 'tomato-basil-spaghetti',
    title: 'Tomato & basil spaghetti',
    description:
      'A quick pantry-friendly pasta with tomatoes, garlic, and fresh basil.',
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    tags: ['quick', 'pasta'],
    published: true,
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    slug: 'parmesan-herb-omelette',
    title: 'Parmesan herb omelette',
    description:
      'A simple, savory omelette finished with parmesan and fresh basil.',
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 8,
    tags: ['breakfast', 'quick'],
    published: true,
  },
];

const recipeDietTypeRows = [
  {
    recipeId: recipeRows[0].id,
    dietTypeId: dietTypeRows[0].id,
  },
  {
    recipeId: recipeRows[0].id,
    dietTypeId: dietTypeRows[1].id,
  },
  {
    recipeId: recipeRows[1].id,
    dietTypeId: dietTypeRows[0].id,
  },
] as const;

const recipeIngredientRows = [
  {
    recipeId: recipeRows[0].id,
    ingredientId: ingredientRows[0].id,
    quantity: 200,
    unit: 'g',
    position: 1,
  },
  {
    recipeId: recipeRows[0].id,
    ingredientId: ingredientRows[1].id,
    quantity: 400,
    unit: 'g',
    position: 2,
  },
  {
    recipeId: recipeRows[0].id,
    ingredientId: ingredientRows[2].id,
    quantity: 2,
    unit: 'clove',
    position: 3,
  },
  {
    recipeId: recipeRows[0].id,
    ingredientId: ingredientRows[3].id,
    quantity: 2,
    unit: 'tbsp',
    position: 4,
  },
  {
    recipeId: recipeRows[0].id,
    ingredientId: ingredientRows[4].id,
    quantity: 15,
    unit: 'g',
    position: 5,
  },
  {
    recipeId: recipeRows[1].id,
    ingredientId: ingredientRows[5].id,
    quantity: 3,
    unit: 'piece',
    position: 1,
  },
  {
    recipeId: recipeRows[1].id,
    ingredientId: ingredientRows[6].id,
    quantity: 30,
    unit: 'g',
    position: 2,
  },
  {
    recipeId: recipeRows[1].id,
    ingredientId: ingredientRows[4].id,
    quantity: 5,
    unit: 'g',
    position: 3,
  },
  {
    recipeId: recipeRows[1].id,
    ingredientId: ingredientRows[3].id,
    quantity: 1,
    unit: 'tbsp',
    position: 4,
  },
] as const;

const recipeStepRows = [
  {
    recipeId: recipeRows[0].id,
    position: 1,
    instruction: 'Cook the spaghetti in salted water until al dente.',
    durationMinutes: 10,
  },
  {
    recipeId: recipeRows[0].id,
    position: 2,
    instruction: 'Gently cook the garlic in olive oil, then add the tomatoes.',
    durationMinutes: 8,
  },
  {
    recipeId: recipeRows[0].id,
    position: 3,
    instruction: 'Toss with the drained pasta and finish with torn basil.',
    durationMinutes: 2,
  },
  {
    recipeId: recipeRows[1].id,
    position: 1,
    instruction: 'Whisk the eggs until evenly combined.',
    durationMinutes: 2,
  },
  {
    recipeId: recipeRows[1].id,
    position: 2,
    instruction: 'Cook the eggs in olive oil over medium-low heat.',
    durationMinutes: 4,
  },
  {
    recipeId: recipeRows[1].id,
    position: 3,
    instruction: 'Add parmesan and basil, fold, and serve.',
    durationMinutes: 2,
  },
] as const;

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const pool = new Pool({ connectionString });
  const database = drizzle(pool);
  try {
    await database.transaction(async (transaction) => {
      await transaction
        .insert(dietTypes)
        .values([...dietTypeRows])
        .onConflictDoNothing();
      await transaction
        .insert(ingredients)
        .values([...ingredientRows])
        .onConflictDoNothing();
      await transaction
        .insert(recipes)
        .values([...recipeRows])
        .onConflictDoNothing();
      await transaction
        .insert(recipeDietTypes)
        .values([...recipeDietTypeRows])
        .onConflictDoNothing();
      await transaction
        .insert(recipeIngredients)
        .values([...recipeIngredientRows])
        .onConflictDoNothing();
      await transaction
        .insert(recipeSteps)
        .values([...recipeStepRows])
        .onConflictDoNothing();
    });
    console.log(
      `Seeded ${recipeRows.length} recipes, ${ingredientRows.length} ingredients, and ${dietTypeRows.length} diet types.`,
    );
  } finally {
    await pool.end();
  }
}

void seed();
