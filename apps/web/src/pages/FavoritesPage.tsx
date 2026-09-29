import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Grid, Heading, Page, Section, Text } from "@retzetar/ui";
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
    <Page>
      <Heading>Favorite recipes</Heading>
      <Text sx={{ mt: 1 }} variant="muted">
        Your saved ideas, ready when you are.
      </Text>
      <Section spacing="lg">
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
          <Grid>
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
          </Grid>
        )}
        {remove.isError && (
          <Alert sx={{ mt: 2 }}>Could not remove that favorite.</Alert>
        )}
      </Section>
    </Page>
  );
}
