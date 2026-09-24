import { create } from "zustand";

export type ScannedIngredientSource = "product" | "receipt";

export type ScannedIngredientDraft = {
  id: string;
  source: ScannedIngredientSource;
  productName: string;
  productType: string;
  ingredientQuery: string;
  quantity: number;
  unit: string;
  expiresOn: string;
  confidence: number;
};

type NewScannedIngredient = Omit<ScannedIngredientDraft, "id">;

type ScannedIngredientsState = {
  ingredients: ScannedIngredientDraft[];
  addIngredients: (ingredients: NewScannedIngredient[]) => void;
  removeIngredient: (id: string) => void;
};

export const useScannedIngredientsStore = create<ScannedIngredientsState>(
  (set) => ({
    ingredients: [],
    addIngredients: (ingredients) =>
      set((state) => ({
        ingredients: [
          ...state.ingredients,
          ...ingredients.map((ingredient) => ({
            ...ingredient,
            id: crypto.randomUUID(),
          })),
        ],
      })),
    removeIngredient: (id) =>
      set((state) => ({
        ingredients: state.ingredients.filter(
          (ingredient) => ingredient.id !== id,
        ),
      })),
  }),
);
