import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../lib/api.ts";
import { authClient } from "../../../lib/auth-client.ts";

export function useRecipeDetail() {
  const { id = "" } = useParams();
  const session = authClient.useSession();
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState("");
  const recipe = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => api.recipe(id),
    enabled: Boolean(id),
  });
  const carts = useQuery({
    queryKey: ["carts"],
    queryFn: api.carts,
    enabled: Boolean(session.data),
  });
  const favorite = useMutation({
    mutationFn: () => api.addFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
  const addMissing = useMutation({
    mutationFn: () => api.addMissing(cartId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] }),
  });

  return {
    addMissing,
    cartId,
    carts,
    favorite,
    recipe,
    session,
    setCartId,
  };
}
