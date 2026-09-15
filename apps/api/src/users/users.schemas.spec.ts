import { updateProfileSchema } from './users.schemas';

describe('updateProfileSchema', () => {
  it('accepts basic information and food preferences', () => {
    expect(
      updateProfileSchema.parse({
        displayName: 'George',
        dietary: {
          preferredDietTypeIds: ['30000000-0000-4000-8000-000000000001'],
          allergicIngredientIds: [],
        },
      }),
    ).toEqual({
      displayName: 'George',
      dietary: {
        preferredDietTypeIds: ['30000000-0000-4000-8000-000000000001'],
        allergicIngredientIds: [],
      },
    });
  });

  it('rejects duplicate selections and empty updates', () => {
    expect(
      updateProfileSchema.safeParse({
        dietary: {
          preferredDietTypeIds: [
            '30000000-0000-4000-8000-000000000001',
            '30000000-0000-4000-8000-000000000001',
          ],
        },
      }).success,
    ).toBe(false);
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });
});
