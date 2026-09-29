import { useState } from "react";
import { useScannedIngredientsStore } from "../../../stores/scanned-ingredients-store.ts";

export function useAddPantryReview() {
  const ingredients = useScannedIngredientsStore((state) => state.ingredients);
  const removeIngredient = useScannedIngredientsStore(
    (state) => state.removeIngredient,
  );
  const receiptScans = useScannedIngredientsStore(
    (state) => state.receiptScans,
  );
  const removeReceiptScan = useScannedIngredientsStore(
    (state) => state.removeReceiptScan,
  );
  const [manualRows, setManualRows] = useState<string[]>([]);
  const addManualRow = () =>
    setManualRows((rows) => [...rows, crypto.randomUUID()]);
  const removeManualRow = (id: string) =>
    setManualRows((rows) => rows.filter((row) => row !== id));
  const excludedReceipts = receiptScans.filter((report) =>
    report.lines.some((line) => !line.includeInPantry),
  );

  return {
    addManualRow,
    excludedReceipts,
    ingredients,
    manualRows,
    removeIngredient,
    removeManualRow,
    removeReceiptScan,
  };
}
