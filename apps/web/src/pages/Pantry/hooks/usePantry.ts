import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api.ts";

export function usePantry() {
  const queryClient = useQueryClient();
  const pantry = useQuery({ queryKey: ["pantry"], queryFn: api.pantry });
  const removeItem = useMutation({
    mutationFn: api.removePantry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantry"] }),
  });

  return { pantry, removeItem };
}
