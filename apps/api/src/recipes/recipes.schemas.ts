import { z } from 'zod';

export const recipeQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const recipeIdSchema = z.object({ id: z.uuid() });

export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
