import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api.ts";

export function useAdminIngredientData() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  const ingredients = useQuery({
    queryKey: ["admin-ingredients"],
    queryFn: () => api.adminIngredients(""),
    enabled: profile.data?.role === "admin",
  });
  const categories = useQuery({
    queryKey: ["admin-ingredient-categories"],
    queryFn: api.adminIngredientCategories,
    enabled: profile.data?.role === "admin",
  });

  return { categories, ingredients, profile };
}
