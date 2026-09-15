import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { ingredients, pantryIngredients } from '../database/schema';
import type { PantryItemInput, PantryUpdateInput } from './pantry.schemas';

@Injectable()
export class PantryService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  list(userId: string) {
    return this.database
      .select({
        id: pantryIngredients.id,
        ingredientId: pantryIngredients.ingredientId,
        name: ingredients.name,
        quantity: pantryIngredients.quantity,
        unit: pantryIngredients.unit,
        expiresAt: pantryIngredients.expiresAt,
      })
      .from(pantryIngredients)
      .innerJoin(
        ingredients,
        eq(pantryIngredients.ingredientId, ingredients.id),
      )
      .where(eq(pantryIngredients.userId, userId))
      .orderBy(ingredients.name);
  }

  async create(userId: string, input: PantryItemInput) {
    try {
      const rows = await this.database
        .insert(pantryIngredients)
        .values({
          ...input,
          userId,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        })
        .returning();
      return rows[0];
    } catch (error: unknown) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException(
          'That ingredient and unit are already in your pantry',
        );
      }
      throw error;
    }
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
      .returning();
    if (!rows[0]) throw new NotFoundException('Pantry item not found');
    return rows[0];
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
