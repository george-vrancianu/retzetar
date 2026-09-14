import { z } from 'zod';

export const createCartSchema = z.object({
  name: z.string().trim().min(1).max(80),
});
export const cartIdSchema = z.object({ id: z.uuid() });
export const cartRecipeParamsSchema = z.object({
  id: z.uuid(),
  recipeId: z.uuid(),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
