import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api.ts";

export function useFavorites() {
  const queryClient = useQueryClient();
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: api.favorites,
  });
  const removeFavorite = useMutation({
    mutationFn: api.removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return { favorites, removeFavorite };
}
