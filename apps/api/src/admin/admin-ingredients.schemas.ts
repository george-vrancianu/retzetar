import { z } from 'zod';

const optionalCategoryId = z.uuid().optional();

export const createAdminIngredientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  defaultUnit: z.string().trim().min(1).max(30),
  categoryId: optionalCategoryId,
});

export const updateAdminIngredientSchema = createAdminIngredientSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one ingredient field is required',
  );

export const createIngredientCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const adminIngredientIdSchema = z.object({ id: z.uuid() });

export type CreateIngredientCategoryInput = z.infer<
  typeof createIngredientCategorySchema
>;

export type CreateAdminIngredientInput = z.infer<
  typeof createAdminIngredientSchema
>;
export type UpdateAdminIngredientInput = z.infer<
  typeof updateAdminIngredientSchema
>;
