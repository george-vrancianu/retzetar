import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api.ts";

export function useCartDetail(id: string) {
  return useQuery({
    queryKey: ["cart", id],
    queryFn: () => api.cart(id),
  });
}
