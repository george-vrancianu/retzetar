import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { api } from "../lib/api.ts";

export function RecipesPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["recipes", search, page],
    queryFn: () => api.recipes(search, page),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSearch(input.trim());
    setPage(1);
  };

  return (
    <section>
      <div className="rounded-3xl bg-herb-700 px-6 py-10 text-white sm:px-10">
        <p className="font-semibold text-herb-100">Cook with confidence</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-black sm:text-5xl">
          Find your next recipe
        </h1>
        <form
          className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row"
          role="search"
          onSubmit={submit}
        >
          <label className="sr-only" htmlFor="recipe-search">
            Search recipes
          </label>
          <input
            id="recipe-search"
            className="field text-slate-900"
            type="search"
            placeholder="Try pasta, soup, or quick dinner"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="btn-secondary" type="submit">
            Search
          </button>
        </form>
      </div>
      <div className="mt-8">
        {query.isPending ? (
          <LoadingState label="Finding recipes" />
        ) : query.isError ? (
          <ErrorState
            message="Recipes could not be loaded."
            retry={() => void query.refetch()}
          />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title={
              search
                ? `No recipes match “${search}”`
                : "No recipes are published yet"
            }
            action={
              search ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setInput("");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  Clear search
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {query.data.pagination.total} recipes
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {query.data.items.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            {query.data.pagination.pages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-4"
                aria-label="Recipe pages"
              >
                <button
                  className="btn-secondary"
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {query.data.pagination.pages}
                </span>
                <button
                  className="btn-secondary"
                  type="button"
                  disabled={page === query.data.pagination.pages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
