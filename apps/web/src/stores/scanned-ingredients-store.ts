import { create } from "zustand";

export type ScannedIngredientSource = "product" | "receipt";

export const HIGH_CONFIDENCE_MATCH = 0.8;

export type ScannedIngredientDraft = {
  id: string;
  source: ScannedIngredientSource;
  productName: string;
  productType: string;
  matchedIngredientId: string | null;
  matchedIngredientName: string | null;
  matchedIngredientDefaultUnit: string | null;
  matchedCategory: string | null;
  matchConfidence: number;
  fallbackIngredientName: string;
  quantity: number | null;
  unit: string;
  expiresOn: string;
  confidence: number;
};

type NewScannedIngredient = Omit<ScannedIngredientDraft, "id">;

export type ReceiptScanLineType =
  | "product"
  | "discount"
  | "fee"
  | "deposit"
  | "subtotal"
  | "tax"
  | "total"
  | "payment"
  | "other";

export type ReceiptScanQuantityType = "count" | "package_size" | "measured";

export type ReceiptScanMatchLine = {
  lineNumber: number;
  sourceText: string;
  lineType: ReceiptScanLineType;
  includeInPantry: boolean;
  exclusionReason: string | null;
  productName: string | null;
  matchedIngredientId: string | null;
  matchedIngredientName: string | null;
  matchedCategory: string | null;
  matchConfidence: number;
  fallbackIngredientName: string | null;
  matchExplanation: string;
  quantityType: ReceiptScanQuantityType | null;
  purchasedCount: number | null;
  quantityPerItem: number | null;
  quantityUnit: string | null;
  quantity: number | null;
  unit: string | null;
};

export type ReceiptScanMatchReport = {
  id: string;
  merchantName: string | null;
  purchaseDate: string | null;
  lines: ReceiptScanMatchLine[];
};

type NewReceiptScanMatchReport = Omit<ReceiptScanMatchReport, "id">;

type ScannedIngredientsState = {
  ingredients: ScannedIngredientDraft[];
  receiptScans: ReceiptScanMatchReport[];
  addIngredients: (ingredients: NewScannedIngredient[]) => void;
  addReceiptScan: (report: NewReceiptScanMatchReport) => void;
  removeIngredient: (id: string) => void;
  removeReceiptScan: (id: string) => void;
};

export const useScannedIngredientsStore = create<ScannedIngredientsState>(
  (set) => ({
    ingredients: [],
    receiptScans: [],
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
    addReceiptScan: (report) =>
      set((state) => ({
        receiptScans: [
          ...state.receiptScans,
          { ...report, id: crypto.randomUUID() },
        ],
      })),
    removeIngredient: (id) =>
      set((state) => ({
        ingredients: state.ingredients.filter(
          (ingredient) => ingredient.id !== id,
        ),
      })),
    removeReceiptScan: (id) =>
      set((state) => ({
        receiptScans: state.receiptScans.filter((report) => report.id !== id),
      })),
  }),
);
