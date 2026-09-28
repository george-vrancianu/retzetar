import { pantryItemSchema, pantryUpdateSchema } from './pantry.schemas';

const ingredientId = '30000000-0000-4000-8000-000000000001';

describe('pantry item schemas', () => {
  it('accepts an optional pantry-specific name and trims it', () => {
    expect(
      pantryItemSchema.parse({
        ingredientId,
        name: '  Greek yogurt  ',
        quantity: 2,
        unit: 'item',
      }),
    ).toMatchObject({ name: 'Greek yogurt' });

    expect(
      pantryItemSchema.safeParse({ ingredientId, quantity: 1, unit: 'item' })
        .success,
    ).toBe(true);
  });

  it('allows clearing a name and rejects empty or excessively long names', () => {
    expect(pantryUpdateSchema.parse({ name: null })).toEqual({ name: null });
    expect(
      pantryItemSchema.safeParse({
        ingredientId,
        name: '   ',
        quantity: 1,
        unit: 'item',
      }).success,
    ).toBe(false);
    expect(
      pantryItemSchema.safeParse({
        ingredientId,
        name: 'x'.repeat(121),
        quantity: 1,
        unit: 'item',
      }).success,
    ).toBe(false);
  });
});
