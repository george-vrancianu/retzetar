import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  Grid,
  Heading,
  Input,
  Navigation,
  Page,
  Section,
  Text,
  VisuallyHidden,
} from "@retzetar/ui";
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
    <Page>
      <Card variant="hero">
        <Text variant="eyebrow">Cook with confidence</Text>
        <Heading variant="display" sx={{ mt: 1, maxWidth: 672 }}>
          Find your next recipe
        </Heading>
        <Form
          spacing="none"
          sx={{
            mt: 3,
            maxWidth: 576,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
          }}
          role="search"
          onSubmit={submit}
        >
          <VisuallyHidden as="label" htmlFor="recipe-search">
            Search recipes
          </VisuallyHidden>
          <Input
            id="recipe-search"
            sx={{
              color: "text.primary",
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
            type="search"
            placeholder="Try pasta, soup, or quick dinner"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button variant="secondary" type="submit">
            Search
          </Button>
        </Form>
      </Card>
      <Section spacing="lg">
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setInput("");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  Clear search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Text sx={{ mb: 2 }} variant="subtle">
              {query.data.pagination.total} recipes
            </Text>
            <Grid>
              {query.data.items.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </Grid>
            {query.data.pagination.pages > 1 && (
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
                <Text
                  as="span"
                  variant="small"
                  sx={{ color: "text.secondary" }}
                >
                  Page {page} of {query.data.pagination.pages}
                </Text>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={page === query.data.pagination.pages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </Navigation>
            )}
          </>
        )}
      </Section>
    </Page>
  );
}
