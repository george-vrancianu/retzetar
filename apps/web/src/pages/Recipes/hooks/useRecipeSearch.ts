import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { api } from "../../../lib/api.ts";

export function useRecipeSearch() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const recipes = useQuery({
    queryKey: ["recipes", search, page],
    queryFn: () => api.recipes(search, page),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSearch(input.trim());
    setPage(1);
  };

  const clear = () => {
    setInput("");
    setSearch("");
    setPage(1);
  };

  return {
    clear,
    input,
    page,
    recipes,
    search,
    setInput,
    setPage,
    submit,
  };
}

export type RecipeSearchController = ReturnType<typeof useRecipeSearch>;
