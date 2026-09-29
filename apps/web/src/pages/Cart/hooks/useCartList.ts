import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api.ts";

export function useCartList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("Weekly groceries");
  const carts = useQuery({ queryKey: ["carts"], queryFn: api.carts });
  const createCart = useMutation({
    mutationFn: () => api.createCart(name),
    onSuccess: async (cart) => {
      await queryClient.invalidateQueries({ queryKey: ["carts"] });
      navigate(`/carts/${cart.id}`);
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    createCart.mutate();
  };

  return { carts, createCart, name, setName, submit };
}
