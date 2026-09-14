import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { api } from "../lib/api.ts";

export function FavoritesPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["favorites"], queryFn: api.favorites });
  const remove = useMutation({
    mutationFn: api.removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return (
    <section>
      <h1 className="text-3xl font-black sm:text-4xl">Favorite recipes</h1>
      <p className="mt-2 text-slate-600">
        Your saved ideas, ready when you are.
      </p>
      <div className="mt-8">
        {query.isPending ? (
          <LoadingState label="Loading favorites" />
        ) : query.isError ? (
          <ErrorState
            message="Favorites could not be loaded."
            retry={() => void query.refetch()}
          />
        ) : query.data.length === 0 ? (
          <EmptyState title="You have not saved any recipes yet" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.map(({ recipe }) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                favoriteAction={{
                  label: "Remove favorite",
                  pending: remove.isPending,
                  onClick: () => remove.mutate(recipe.id),
                }}
              />
            ))}
          </div>
        )}
        {remove.isError && (
          <p className="mt-4 text-red-700" role="alert">
            Could not remove that favorite.
          </p>
        )}
      </div>
    </section>
  );
}
