import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  ingredients,
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
    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  listIngredients(query: string) {
    return this.database
      .select({
        id: ingredients.id,
        name: ingredients.name,
        defaultUnit: ingredients.defaultUnit,
        category: ingredients.category,
      })
      .from(ingredients)
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

    const [ingredientRows, steps] = await Promise.all([
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
    ]);

    return { ...recipe, ingredients: ingredientRows, steps };
  }
}
