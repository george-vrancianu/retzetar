import { Link } from "react-router-dom";
import type { Recipe } from "../lib/api.ts";

export function RecipeCard({
  recipe,
  favoriteAction,
}: {
  recipe: Recipe;
  favoriteAction?: { label: string; onClick: () => void; pending?: boolean };
}) {
  return (
    <article className="card flex h-full flex-col overflow-hidden p-0">
      {recipe.imageUrl ? (
        <img
          className="h-44 w-full object-cover"
          src={recipe.imageUrl}
          alt=""
        />
      ) : (
        <div
          className="flex h-44 items-center justify-center bg-herb-50 text-herb-700"
          aria-hidden="true"
        >
          Recipe
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-bold text-slate-900">
          <Link className="hover:text-herb-700" to={`/recipes/${recipe.id}`}>
            {recipe.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
          {recipe.description}
        </p>
        <p className="mt-4 text-sm font-medium text-slate-500">
          {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.servings}{" "}
          servings
        </p>
        {favoriteAction && (
          <button
            type="button"
            className="btn-secondary mt-4"
            disabled={favoriteAction.pending}
            onClick={favoriteAction.onClick}
          >
            {favoriteAction.label}
          </button>
        )}
      </div>
    </article>
  );
}
