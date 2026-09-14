import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";

export function PantryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    defaultUnit: string;
  } | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const pantry = useQuery({ queryKey: ["pantry"], queryFn: api.pantry });
  const ingredients = useQuery({
    queryKey: ["ingredients", search],
    queryFn: () => api.ingredients(search),
    enabled: search.trim().length >= 2,
  });
  const add = useMutation({
    mutationFn: api.addPantry,
    onSuccess: async () => {
      setSelected(null);
      setSearch("");
      setQuantity("1");
      await queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });
  const remove = useMutation({
    mutationFn: api.removePantry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantry"] }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    add.mutate({ ingredientId: selected.id, quantity: Number(quantity), unit });
  };

  return (
    <section>
      <h1 className="text-3xl font-black sm:text-4xl">Your pantry</h1>
      <p className="mt-2 text-slate-600">
        Track ingredients so carts only include what is missing.
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          {pantry.isPending ? (
            <LoadingState label="Opening pantry" />
          ) : pantry.isError ? (
            <ErrorState
              message="Your pantry could not be loaded."
              retry={() => void pantry.refetch()}
            />
          ) : pantry.data.length === 0 ? (
            <EmptyState title="Your pantry is empty" />
          ) : (
            <ul className="space-y-3">
              {pantry.data.map((item) => (
                <li
                  className="card flex items-center justify-between gap-4"
                  key={item.id}
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-700"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(item.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form className="card" onSubmit={submit}>
          <h2 className="text-xl font-bold">Add an ingredient</h2>
          <label className="mt-4 block font-semibold">
            Find ingredient
            <input
              className="field mt-1"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelected(null);
              }}
              placeholder="Type at least 2 letters"
            />
          </label>
          {ingredients.isFetching && (
            <p className="mt-2 text-sm" role="status">
              Searching…
            </p>
          )}
          {ingredients.data && !selected && (
            <ul
              className="mt-2 max-h-40 overflow-auto rounded-lg border border-slate-200"
              aria-label="Ingredient results"
            >
              {ingredients.data.map((ingredient) => (
                <li key={ingredient.id}>
                  <button
                    className="w-full px-3 py-2 text-left hover:bg-herb-50"
                    type="button"
                    onClick={() => {
                      setSelected(ingredient);
                      setSearch(ingredient.name);
                      setUnit(ingredient.defaultUnit);
                    }}
                  >
                    {ingredient.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="font-semibold">
              Quantity
              <input
                className="field mt-1"
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
            </label>
            <label className="font-semibold">
              Unit
              <input
                className="field mt-1"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                required
              />
            </label>
          </div>
          <button
            className="btn-primary mt-4 w-full"
            type="submit"
            disabled={!selected || add.isPending}
          >
            {add.isPending ? "Adding…" : "Add to pantry"}
          </button>
          {(add.isError || remove.isError) && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              The pantry could not be updated. Check for a duplicate and try
              again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
