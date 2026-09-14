import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState, LoadingState } from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";
import { authClient } from "../lib/auth-client.ts";

export function RecipeDetailPage() {
  const { id = "" } = useParams();
  const session = authClient.useSession();
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState("");
  const recipe = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => api.recipe(id),
    enabled: Boolean(id),
  });
  const carts = useQuery({
    queryKey: ["carts"],
    queryFn: api.carts,
    enabled: Boolean(session.data),
  });
  const favorite = useMutation({
    mutationFn: () => api.addFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
  const addMissing = useMutation({
    mutationFn: () => api.addMissing(cartId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] }),
  });

  if (recipe.isPending) return <LoadingState label="Loading recipe" />;
  if (recipe.isError)
    return (
      <ErrorState
        message="That recipe could not be loaded."
        retry={() => void recipe.refetch()}
      />
    );

  return (
    <article>
      <Link className="font-semibold text-herb-700" to="/recipes">
        ← All recipes
      </Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div>
          {recipe.data.imageUrl && (
            <img
              className="max-h-96 w-full rounded-3xl object-cover"
              src={recipe.data.imageUrl}
              alt=""
            />
          )}
          <h1 className="mt-6 text-4xl font-black">{recipe.data.title}</h1>
          <p className="mt-3 text-lg text-slate-600">
            {recipe.data.description}
          </p>
          <section className="mt-8">
            <h2 className="text-2xl font-bold">Method</h2>
            <ol className="mt-4 space-y-4">
              {recipe.data.steps.map((step) => (
                <li className="card flex gap-4" key={step.id}>
                  <span className="font-black text-herb-700">
                    {step.position}
                  </span>
                  <p>{step.instruction}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="card">
            <h2 className="text-xl font-bold">Ingredients</h2>
            <ul className="mt-4 space-y-2">
              {recipe.data.ingredients.map((item) => (
                <li className="flex justify-between gap-3" key={item.id}>
                  <span>{item.name}</span>
                  <span className="text-slate-500">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          {session.data ? (
            <section className="card space-y-3">
              <button
                className="btn-secondary w-full"
                type="button"
                disabled={favorite.isPending}
                onClick={() => favorite.mutate()}
              >
                {favorite.isSuccess ? "Saved!" : "Save favorite"}
              </button>
              {carts.data && carts.data.length > 0 ? (
                <>
                  <label className="block font-semibold">
                    Shopping cart
                    <select
                      className="field mt-1"
                      value={cartId}
                      onChange={(event) => setCartId(event.target.value)}
                    >
                      <option value="">Choose a cart</option>
                      {carts.data.map((cart) => (
                        <option key={cart.id} value={cart.id}>
                          {cart.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="btn-primary w-full"
                    type="button"
                    disabled={!cartId || addMissing.isPending}
                    onClick={() => addMissing.mutate()}
                  >
                    Add missing ingredients
                  </button>
                </>
              ) : (
                <Link className="btn-primary w-full" to="/carts">
                  Create a cart
                </Link>
              )}
              {addMissing.isSuccess && (
                <p className="text-sm text-herb-700" role="status">
                  Added {addMissing.data.added.length} missing ingredients.
                </p>
              )}
              {(favorite.isError || addMissing.isError) && (
                <p className="text-sm text-red-700" role="alert">
                  That action failed. Please try again.
                </p>
              )}
            </section>
          ) : (
            <Link className="btn-primary w-full" to="/auth">
              Sign in to save or shop
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
