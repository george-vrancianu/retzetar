import { z } from 'zod';

export const pantryItemSchema = z.object({
  ingredientId: z.uuid(),
  name: z.string().trim().min(1).max(120).nullable().optional(),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(30),
  expiresAt: z.iso.datetime().nullable().optional(),
});

export const pantryUpdateSchema = pantryItemSchema
  .omit({ ingredientId: true })
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field is required',
  );

export const pantryIdSchema = z.object({ id: z.uuid() });
export type PantryItemInput = z.infer<typeof pantryItemSchema>;
export type PantryUpdateInput = z.infer<typeof pantryUpdateSchema>;
