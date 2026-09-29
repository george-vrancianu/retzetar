import {
  HIGH_CONFIDENCE_MATCH,
  type ScannedIngredientDraft,
} from "../../../stores/scanned-ingredients-store.ts";

export function matchGroup(item: ScannedIngredientDraft) {
  if (
    !item.matchedIngredientId ||
    !item.matchedIngredientName ||
    item.matchConfidence <= 0
  ) {
    return "unmatched";
  }

  return item.matchConfidence >= HIGH_CONFIDENCE_MATCH ? "matched" : "review";
}

export const ingredientGroups = [
  {
    key: "matched",
    label: "High confidence",
    style: { bgcolor: "primary.light", color: "primary.main" },
  },
  {
    key: "review",
    label: "Review required",
    style: { bgcolor: "#fef3c7", color: "#78350f" },
  },
  {
    key: "unmatched",
    label: "No catalog match",
    style: { bgcolor: "grey.100", color: "text.secondary" },
  },
] as const;
