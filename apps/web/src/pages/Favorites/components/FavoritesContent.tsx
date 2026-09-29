import { Alert, Grid } from "@retzetar/ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/QueryState.tsx";
import { RecipeCard } from "../../../components/RecipeCard.tsx";
import { useFavorites } from "../hooks/useFavorites.ts";

export function FavoritesContent() {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.isPending) return <LoadingState label="Loading favorites" />;
  if (favorites.isError) {
    return (
      <ErrorState
        message="Favorites could not be loaded."
        retry={() => void favorites.refetch()}
      />
    );
  }
  if (favorites.data.length === 0) {
    return <EmptyState title="You have not saved any recipes yet" />;
  }

  return (
    <>
      <Grid>
        {favorites.data.map(({ recipe }) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            favoriteAction={{
              label: "Remove favorite",
              pending: removeFavorite.isPending,
              onClick: () => removeFavorite.mutate(recipe.id),
            }}
          />
        ))}
      </Grid>
      {removeFavorite.isError && (
        <Alert sx={{ mt: 2 }}>Could not remove that favorite.</Alert>
      )}
    </>
  );
}
