export type RequiredIngredient = {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
};

export type PantryQuantity = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

export type MissingIngredient = RequiredIngredient;

const keyFor = (ingredientId: string, unit: string) =>
  `${ingredientId}:${unit.trim().toLowerCase()}`;

export function calculateMissingIngredients(
  required: RequiredIngredient[],
  pantry: PantryQuantity[],
): MissingIngredient[] {
  const availableByIngredient = new Map<string, number>();
  for (const item of pantry) {
    const key = keyFor(item.ingredientId, item.unit);
    availableByIngredient.set(
      key,
      (availableByIngredient.get(key) ?? 0) + item.quantity,
    );
  }

  const requiredByIngredient = new Map<string, RequiredIngredient>();
  for (const item of required) {
    const key = keyFor(item.ingredientId, item.unit);
    const existing = requiredByIngredient.get(key);
    requiredByIngredient.set(key, {
      ...item,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  }

  return [...requiredByIngredient.entries()].flatMap(([key, item]) => {
    const missing = item.quantity - (availableByIngredient.get(key) ?? 0);
    return missing > 0 ? [{ ...item, quantity: missing }] : [];
  });
}
