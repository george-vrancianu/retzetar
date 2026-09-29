import { useQuery } from "@tanstack/react-query";
import { ActionLink, List, ListItem, Text } from "@retzetar/ui";
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";

export type WidgetProps = {
  settings: Record<string, string | number | boolean>;
};

export function PantrySummary() {
  const query = useQuery({ queryKey: ["pantry"], queryFn: api.pantry });
  if (query.isPending) return <LoadingState label="Loading pantry" />;
  if (query.isError) {
    return (
      <ErrorState
        message="Pantry summary is unavailable."
        retry={() => void query.refetch()}
      />
    );
  }
  return (
    <Text variant="metric">
      {query.data.length}{" "}
      <Text
        as="span"
        sx={{ fontSize: "1rem", fontWeight: 500, color: "text.secondary" }}
      >
        items ready
      </Text>
    </Text>
  );
}

export function RecommendedRecipes({ settings }: WidgetProps) {
  const query = useQuery({
    queryKey: ["recipes", "dashboard"],
    queryFn: () => api.recipes(),
  });
  if (query.isPending) return <LoadingState label="Finding recipes" />;
  if (query.isError) {
    return (
      <ErrorState
        message="Recipe ideas are unavailable."
        retry={() => void query.refetch()}
      />
    );
  }
  const limit = typeof settings.limit === "number" ? settings.limit : 4;
  const recipes = query.data.items.slice(0, limit);
  if (recipes.length === 0)
    return <EmptyState title="No recipes published yet" />;
  return (
    <List variant="compact">
      {recipes.map((recipe) => (
        <ListItem key={recipe.id}>
          <ActionLink as={Link} to={`/recipes/${recipe.id}`}>
            {recipe.title}
          </ActionLink>
        </ListItem>
      ))}
    </List>
  );
}

export function FavoriteSummary() {
  const query = useQuery({ queryKey: ["favorites"], queryFn: api.favorites });
  if (query.isPending) return <LoadingState label="Loading favorites" />;
  if (query.isError) {
    return (
      <ErrorState
        message="Favorites are unavailable."
        retry={() => void query.refetch()}
      />
    );
  }
  return query.data.length === 0 ? (
    <EmptyState
      title="No favorites yet"
      action={
        <ActionLink as={Link} to="/recipes">
          Find a recipe
        </ActionLink>
      }
    />
  ) : (
    <Text>
      <Text as="strong" sx={{ fontSize: "1.875rem", color: "primary.main" }}>
        {query.data.length}
      </Text>{" "}
      saved recipes
    </Text>
  );
}

export function ActiveCart() {
  const query = useQuery({ queryKey: ["carts"], queryFn: api.carts });
  if (query.isPending) return <LoadingState label="Loading carts" />;
  if (query.isError) {
    return (
      <ErrorState
        message="Cart is unavailable."
        retry={() => void query.refetch()}
      />
    );
  }
  const cart = query.data.find((item) => item.status === "active");
  return cart ? (
    <ActionLink as={Link} to={`/carts/${cart.id}`}>
      Continue “{cart.name}”
    </ActionLink>
  ) : (
    <EmptyState
      title="No active cart"
      action={
        <ActionLink as={Link} to="/carts">
          Create one
        </ActionLink>
      }
    />
  );
}
