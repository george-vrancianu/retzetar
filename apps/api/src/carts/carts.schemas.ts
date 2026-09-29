import { z } from 'zod';

export const createCartSchema = z.object({
  name: z.string().trim().min(1).max(80),
});
export const cartIdSchema = z.object({ id: z.uuid() });
export const addCartItemsSchema = z.object({ items: z.array(z.object({ ingredientId: z.uuid(), quantity: z.number().positive().max(1000000), unit: z.string().trim().min(1).max(30) })).min(1).max(100) });
export const cartRecipeParamsSchema = z.object({
  id: z.uuid(),
  recipeId: z.uuid(),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;

export type AddCartItemsInput = z.infer<typeof addCartItemsSchema>;
