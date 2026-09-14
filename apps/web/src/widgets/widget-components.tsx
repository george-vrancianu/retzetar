import { useQuery } from "@tanstack/react-query";
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
    <p className="text-3xl font-black text-herb-700">
      {query.data.length}{" "}
      <span className="text-base font-medium text-slate-600">items ready</span>
    </p>
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
    <ul className="space-y-2">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link
            className="font-semibold text-herb-700 hover:underline"
            to={`/recipes/${recipe.id}`}
          >
            {recipe.title}
          </Link>
        </li>
      ))}
    </ul>
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
        <Link className="text-herb-700 underline" to="/recipes">
          Find a recipe
        </Link>
      }
    />
  ) : (
    <p>
      <strong className="text-3xl text-herb-700">{query.data.length}</strong>{" "}
      saved recipes
    </p>
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
    <Link
      className="font-semibold text-herb-700 underline"
      to={`/carts/${cart.id}`}
    >
      Continue “{cart.name}”
    </Link>
  ) : (
    <EmptyState
      title="No active cart"
      action={
        <Link className="text-herb-700 underline" to="/carts">
          Create one
        </Link>
      }
    />
  );
}
