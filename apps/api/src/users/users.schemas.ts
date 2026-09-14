import { z } from 'zod';

const dietarySchema = z.object({
  diets: z.array(z.string().trim().min(1).max(50)).max(20),
  allergens: z.array(z.string().trim().min(1).max(50)).max(50),
  dislikedIngredients: z.array(z.string().trim().min(1).max(100)).max(100),
});

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).nullable().optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    avatarUrl: z.url().nullable().optional(),
    locale: z
      .string()
      .trim()
      .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/)
      .optional(),
    dietary: dietarySchema.partial().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one profile field is required',
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
