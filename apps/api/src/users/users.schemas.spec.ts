import { updateProfileSchema } from './users.schemas';

describe('updateProfileSchema', () => {
  it('accepts basic information and food preferences', () => {
    expect(
      updateProfileSchema.parse({
        displayName: 'George',
        dietary: { diets: ['vegetarian'], allergens: [] },
      }),
    ).toEqual({
      displayName: 'George',
      dietary: { diets: ['vegetarian'], allergens: [] },
    });
  });

  it('rejects an empty update', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });
});
