import {
  HIGH_CONFIDENCE_MATCH,
  type ReceiptScanMatchReport,
} from "../../../stores/scanned-ingredients-store.ts";

type ReceiptLine = ReceiptScanMatchReport["lines"][number];

export function receiptMatchLabel(line: ReceiptLine) {
  if (!line.includeInPantry) {
    return `Excluded · ${line.exclusionReason ?? line.lineType}`;
  }

  if (line.matchedIngredientId && line.matchedIngredientName) {
    const prefix =
      line.matchConfidence >= HIGH_CONFIDENCE_MATCH
        ? "Matched"
        : "Possible match";
    const reviewNote =
      line.matchConfidence >= HIGH_CONFIDENCE_MATCH
        ? ""
        : " · review required";
    return `${prefix}: ${line.matchedIngredientName}${
      line.matchedCategory ? ` · ${line.matchedCategory}` : ""
    } · ${Math.round(line.matchConfidence * 100)}%${reviewNote}`;
  }

  return `No catalog match · Suggested search: ${
    line.fallbackIngredientName ?? "manual review"
  }`;
}

export function receiptQuantityLabel(line: ReceiptLine) {
  if (
    line.quantityType === "package_size" &&
    line.purchasedCount !== null &&
    line.quantityPerItem !== null &&
    line.quantityUnit &&
    line.quantity !== null &&
    line.unit
  ) {
    return `${line.purchasedCount} package${line.purchasedCount === 1 ? "" : "s"} × ${line.quantityPerItem} ${line.quantityUnit} = ${line.quantity} ${line.unit}`;
  }

  if (line.quantityType === "measured" && line.quantity !== null && line.unit) {
    return `Measured amount: ${line.quantity} ${line.unit}`;
  }

  if (line.quantity !== null && line.unit) {
    return `Purchased count: ${line.quantity} ${line.unit}`;
  }

  return null;
}
