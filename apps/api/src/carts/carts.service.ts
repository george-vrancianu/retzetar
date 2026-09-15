import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  cartItems,
  carts,
  ingredients,
  pantryIngredients,
  recipeIngredients,
  recipes,
} from '../database/schema';
import type { CreateCartInput } from './carts.schemas';
import { calculateMissingIngredients } from './missing-ingredients';

@Injectable()
export class CartsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async create(userId: string, input: CreateCartInput) {
    const rows = await this.database
      .insert(carts)
      .values({ userId, name: input.name })
      .returning();
    return rows[0];
  }

  list(userId: string) {
    return this.database
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .orderBy(desc(carts.updatedAt));
  }

  async get(userId: string, id: string) {
    const cartRows = await this.database
      .select()
      .from(carts)
      .where(and(eq(carts.id, id), eq(carts.userId, userId)))
      .limit(1);
    const cart = cartRows[0];
    if (!cart) throw new NotFoundException('Cart not found');

    const items = await this.database
      .select({
        id: cartItems.id,
        ingredientId: cartItems.ingredientId,
        name: ingredients.name,
        quantity: cartItems.quantity,
        unit: cartItems.unit,
        checked: cartItems.checked,
        sourceRecipeId: cartItems.sourceRecipeId,
      })
      .from(cartItems)
      .innerJoin(ingredients, eq(cartItems.ingredientId, ingredients.id))
      .where(eq(cartItems.cartId, id))
      .orderBy(ingredients.name);
    return { ...cart, items };
  }

  async addRecipeMissingIngredients(
    userId: string,
    cartId: string,
    recipeId: string,
  ) {
    const [cartRows, recipeRows] = await Promise.all([
      this.database
        .select({ id: carts.id })
        .from(carts)
        .where(and(eq(carts.id, cartId), eq(carts.userId, userId)))
        .limit(1),
      this.database
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.id, recipeId), eq(recipes.published, true)))
        .limit(1),
    ]);
    if (!cartRows[0]) throw new NotFoundException('Cart not found');
    if (!recipeRows[0]) throw new NotFoundException('Recipe not found');

    const [required, pantry] = await Promise.all([
      this.database
        .select({
          ingredientId: recipeIngredients.ingredientId,
          name: ingredients.name,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit,
        })
        .from(recipeIngredients)
        .innerJoin(
          ingredients,
          eq(recipeIngredients.ingredientId, ingredients.id),
        )
        .where(eq(recipeIngredients.recipeId, recipeId)),
      this.database
        .select({
          ingredientId: pantryIngredients.ingredientId,
          quantity: pantryIngredients.quantity,
          unit: pantryIngredients.unit,
        })
        .from(pantryIngredients)
        .where(eq(pantryIngredients.userId, userId)),
    ]);
    const missing = calculateMissingIngredients(required, pantry);

    if (missing.length > 0) {
      await this.database.transaction(async (transaction) => {
        for (const item of missing) {
          await transaction
            .insert(cartItems)
            .values({
              cartId,
              ingredientId: item.ingredientId,
              quantity: item.quantity,
              unit: item.unit,
              sourceRecipeId: recipeId,
            })
            .onConflictDoUpdate({
              target: [
                cartItems.cartId,
                cartItems.ingredientId,
                cartItems.unit,
              ],
              set: {
                quantity: sql`${cartItems.quantity} + excluded.quantity`,
                updatedAt: new Date(),
              },
            });
        }
        await transaction
          .update(carts)
          .set({ updatedAt: new Date() })
          .where(eq(carts.id, cartId));
      });
    }

    return { added: missing, cart: await this.get(userId, cartId) };
  }
}
