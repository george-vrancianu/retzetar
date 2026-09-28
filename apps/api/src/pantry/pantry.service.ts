import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  ingredientCategories,
  ingredients,
  pantryIngredients,
} from '../database/schema';
import type { PantryItemInput, PantryUpdateInput } from './pantry.schemas';

const pantryItemSelection = {
  id: pantryIngredients.id,
  ingredientId: pantryIngredients.ingredientId,
  ingredientName: ingredients.name,
  name: sql<string>`coalesce(${pantryIngredients.name}, ${ingredients.name})`,
  category: ingredientCategories.name,
  quantity: pantryIngredients.quantity,
  unit: pantryIngredients.unit,
  expiresAt: pantryIngredients.expiresAt,
};

@Injectable()
export class PantryService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  list(userId: string) {
    return this.database
      .select(pantryItemSelection)
      .from(pantryIngredients)
      .innerJoin(
        ingredients,
        eq(pantryIngredients.ingredientId, ingredients.id),
      )
      .innerJoin(
        ingredientCategories,
        eq(ingredients.categoryId, ingredientCategories.id),
      )
      .where(eq(pantryIngredients.userId, userId))
      .orderBy(ingredients.name, pantryIngredients.createdAt);
  }

  async create(userId: string, input: PantryItemInput) {
    const [row] = await this.database
      .insert(pantryIngredients)
      .values({
        ...input,
        userId,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      })
      .returning({ id: pantryIngredients.id });
    return this.getOne(userId, row.id);
  }

  async update(userId: string, id: string, input: PantryUpdateInput) {
    const rows = await this.database
      .update(pantryIngredients)
      .set({
        ...input,
        expiresAt:
          input.expiresAt === undefined
            ? undefined
            : input.expiresAt === null
              ? null
              : new Date(input.expiresAt),
        updatedAt: new Date(),
      })
      .where(
        and(eq(pantryIngredients.id, id), eq(pantryIngredients.userId, userId)),
      )
      .returning({ id: pantryIngredients.id });
    if (!rows[0]) throw new NotFoundException('Pantry item not found');
    return this.getOne(userId, rows[0].id);
  }

  private async getOne(userId: string, id: string) {
    const [item] = await this.database
      .select(pantryItemSelection)
      .from(pantryIngredients)
      .innerJoin(
        ingredients,
        eq(pantryIngredients.ingredientId, ingredients.id),
      )
      .innerJoin(
        ingredientCategories,
        eq(ingredients.categoryId, ingredientCategories.id),
      )
      .where(
        and(eq(pantryIngredients.id, id), eq(pantryIngredients.userId, userId)),
      )
      .limit(1);
    if (!item) throw new NotFoundException('Pantry item not found');
    return item;
  }

  async remove(userId: string, id: string) {
    const rows = await this.database
      .delete(pantryIngredients)
      .where(
        and(eq(pantryIngredients.id, id), eq(pantryIngredients.userId, userId)),
      )
      .returning({ id: pantryIngredients.id });
    if (!rows[0]) throw new NotFoundException('Pantry item not found');
    return rows[0];
  }
}
