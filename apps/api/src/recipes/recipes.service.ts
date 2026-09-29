import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  dietTypes,
  ingredientCategories,
  ingredients,
  recipeDietTypes,
  recipeIngredients,
  recipes,
  recipeSteps,
} from '../database/schema';
import type { RecipeQuery } from './recipes.schemas';

@Injectable()
export class RecipesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async list(query: RecipeQuery) {
    const search = query.q
      ? or(
          ilike(recipes.title, `%${query.q}%`),
          ilike(recipes.description, `%${query.q}%`),
        )
      : undefined;
    const where = and(eq(recipes.published, true), search);
    const offset = (query.page - 1) * query.limit;

    const [items, totalRows] = await Promise.all([
      this.database
        .select()
        .from(recipes)
        .where(where)
        .orderBy(desc(recipes.createdAt))
        .limit(query.limit)
        .offset(offset),
      this.database.select({ total: count() }).from(recipes).where(where),
    ]);

    const total = totalRows[0]?.total ?? 0;
    const dietTypesByRecipe = await this.getDietTypesByRecipeId(
      items.map((recipe) => recipe.id),
    );
    return {
      items: items.map((recipe) => ({
        ...recipe,
        dietTypes: dietTypesByRecipe.get(recipe.id) ?? [],
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  async plateCandidates() {
    const recipeRows = await this.database.select({ id: recipes.id, title: recipes.title, description: recipes.description }).from(recipes).where(eq(recipes.published, true)).orderBy(recipes.title).limit(200);
    const ingredientRows = await this.database.select({ recipeId: recipeIngredients.recipeId, name: ingredients.name }).from(recipeIngredients).innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id));
    return recipeRows.map((recipe) => ({ ...recipe, ingredients: ingredientRows.filter((ingredient) => ingredient.recipeId === recipe.id).map((ingredient) => ingredient.name) }));
  }

  listDietTypes() {
    return this.database
      .select({ id: dietTypes.id, name: dietTypes.name })
      .from(dietTypes)
      .orderBy(dietTypes.name);
  }

  listIngredients(query: string) {
    return this.database
      .select({
        id: ingredients.id,
        name: ingredients.name,
        defaultUnit: ingredients.defaultUnit,
        category: ingredientCategories.name,
      })
      .from(ingredients)
      .innerJoin(
        ingredientCategories,
        eq(ingredients.categoryId, ingredientCategories.id),
      )
      .where(query ? ilike(ingredients.name, `%${query}%`) : undefined)
      .orderBy(ingredients.name)
      .limit(30);
  }

  async get(id: string) {
    const rows = await this.database
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.published, true)))
      .limit(1);
    const recipe = rows[0];
    if (!recipe) throw new NotFoundException('Recipe not found');

    const [ingredientRows, steps, dietTypesByRecipe] = await Promise.all([
      this.database
        .select({
          id: recipeIngredients.id,
          ingredientId: ingredients.id,
          name: ingredients.name,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit,
          note: recipeIngredients.note,
          position: recipeIngredients.position,
        })
        .from(recipeIngredients)
        .innerJoin(
          ingredients,
          eq(recipeIngredients.ingredientId, ingredients.id),
        )
        .where(eq(recipeIngredients.recipeId, id))
        .orderBy(recipeIngredients.position),
      this.database
        .select()
        .from(recipeSteps)
        .where(eq(recipeSteps.recipeId, id))
        .orderBy(recipeSteps.position),
      this.getDietTypesByRecipeId([id]),
    ]);

    return {
      ...recipe,
      dietTypes: dietTypesByRecipe.get(id) ?? [],
      ingredients: ingredientRows,
      steps,
    };
  }

  private async getDietTypesByRecipeId(recipeIds: string[]) {
    if (recipeIds.length === 0)
      return new Map<string, Array<{ id: string; name: string }>>();

    const rows = await this.database
      .select({
        recipeId: recipeDietTypes.recipeId,
        id: dietTypes.id,
        name: dietTypes.name,
      })
      .from(recipeDietTypes)
      .innerJoin(dietTypes, eq(recipeDietTypes.dietTypeId, dietTypes.id))
      .where(inArray(recipeDietTypes.recipeId, recipeIds))
      .orderBy(dietTypes.name);

    return rows.reduce((grouped, row) => {
      const values = grouped.get(row.recipeId) ?? [];
      values.push({ id: row.id, name: row.name });
      grouped.set(row.recipeId, values);
      return grouped;
    }, new Map<string, Array<{ id: string; name: string }>>());
  }
}
