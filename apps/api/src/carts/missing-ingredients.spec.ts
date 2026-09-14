import { calculateMissingIngredients } from './missing-ingredients';

describe('calculateMissingIngredients', () => {
  it('aggregates requirements and subtracts pantry quantities with matching units', () => {
    const result = calculateMissingIngredients(
      [
        { ingredientId: 'flour', name: 'Flour', quantity: 200, unit: 'g' },
        { ingredientId: 'flour', name: 'Flour', quantity: 100, unit: 'g' },
        { ingredientId: 'egg', name: 'Egg', quantity: 2, unit: 'piece' },
      ],
      [
        { ingredientId: 'flour', quantity: 250, unit: 'G' },
        { ingredientId: 'egg', quantity: 2, unit: 'piece' },
      ],
    );

    expect(result).toEqual([
      { ingredientId: 'flour', name: 'Flour', quantity: 50, unit: 'g' },
    ]);
  });

  it('does not convert incompatible units implicitly', () => {
    expect(
      calculateMissingIngredients(
        [{ ingredientId: 'milk', name: 'Milk', quantity: 1, unit: 'l' }],
        [{ ingredientId: 'milk', quantity: 1000, unit: 'ml' }],
      ),
    ).toEqual([{ ingredientId: 'milk', name: 'Milk', quantity: 1, unit: 'l' }]);
  });
});
