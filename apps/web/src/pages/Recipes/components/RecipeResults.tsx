import { Button, Grid, Navigation, Text } from "@retzetar/ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/QueryState.tsx";
import { RecipeCard } from "../../../components/RecipeCard.tsx";
import type { RecipeSearchController } from "../hooks/useRecipeSearch.ts";

export function RecipeResults({
  controller,
}: {
  controller: RecipeSearchController;
}) {
  const { page, recipes, search, setPage } = controller;

  if (recipes.isPending) return <LoadingState label="Finding recipes" />;
  if (recipes.isError) {
    return (
      <ErrorState
        message="Recipes could not be loaded."
        retry={() => void recipes.refetch()}
      />
    );
  }
  if (recipes.data.items.length === 0) {
    return (
      <EmptyState
        title={
          search
            ? `No recipes match “${search}”`
            : "No recipes are published yet"
        }
        action={
          search ? (
            <Button type="button" variant="secondary" onClick={controller.clear}>
              Clear search
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <Text sx={{ mb: 2 }} variant="subtle">
        {recipes.data.pagination.total} recipes
      </Text>
      <Grid>
        {recipes.data.items.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </Grid>
      {recipes.data.pagination.pages > 1 && (
        <Navigation
          gap="lg"
          sx={{ mt: 4, alignItems: "center", justifyContent: "center" }}
          aria-label="Recipe pages"
        >
          <Button
            variant="secondary"
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Text as="span" variant="small" sx={{ color: "text.secondary" }}>
            Page {page} of {recipes.data.pagination.pages}
          </Text>
          <Button
            variant="secondary"
            type="button"
            disabled={page === recipes.data.pagination.pages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </Navigation>
      )}
    </>
  );
}
