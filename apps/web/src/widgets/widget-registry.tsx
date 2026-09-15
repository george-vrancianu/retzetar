import type { ComponentType } from "react";
import type { WidgetType } from "../lib/api.ts";
import {
  ActiveCart,
  FavoriteSummary,
  PantrySummary,
  RecommendedRecipes,
  type WidgetProps,
} from "./widget-components.tsx";

export const FRONTEND_WIDGET_REGISTRY: Record<
  WidgetType,
  ComponentType<WidgetProps>
> = {
  "pantry-summary": PantrySummary,
  "recommended-recipes": RecommendedRecipes,
  favorites: FavoriteSummary,
  "active-cart": ActiveCart,
};
