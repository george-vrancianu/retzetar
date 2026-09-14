import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";

function CartList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("Weekly groceries");
  const carts = useQuery({ queryKey: ["carts"], queryFn: api.carts });
  const create = useMutation({
    mutationFn: () => api.createCart(name),
    onSuccess: async (cart) => {
      await queryClient.invalidateQueries({ queryKey: ["carts"] });
      navigate(`/carts/${cart.id}`);
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <section>
      <h1 className="text-3xl font-black sm:text-4xl">Shopping carts</h1>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          {carts.isPending ? (
            <LoadingState />
          ) : carts.isError ? (
            <ErrorState
              message="Carts could not be loaded."
              retry={() => void carts.refetch()}
            />
          ) : carts.data.length === 0 ? (
            <EmptyState title="No carts yet" />
          ) : (
            <ul className="space-y-3">
              {carts.data.map((cart) => (
                <li className="card" key={cart.id}>
                  <Link
                    className="text-lg font-bold text-herb-700 hover:underline"
                    to={`/carts/${cart.id}`}
                  >
                    {cart.name}
                  </Link>
                  <p className="text-sm capitalize text-slate-500">
                    {cart.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form className="card" onSubmit={submit}>
          <h2 className="text-xl font-bold">New cart</h2>
          <label className="mt-4 block font-semibold">
            Name
            <input
              className="field mt-1"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <button
            className="btn-primary mt-4 w-full"
            type="submit"
            disabled={create.isPending}
          >
            Create cart
          </button>
          {create.isError && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              Could not create the cart.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function CartDetail({ id }: { id: string }) {
  const cart = useQuery({
    queryKey: ["cart", id],
    queryFn: () => api.cart(id),
  });
  if (cart.isPending) return <LoadingState label="Loading cart" />;
  if (cart.isError)
    return (
      <ErrorState
        message="This cart could not be loaded."
        retry={() => void cart.refetch()}
      />
    );
  return (
    <section>
      <Link className="font-semibold text-herb-700" to="/carts">
        ← All carts
      </Link>
      <h1 className="mt-5 text-3xl font-black sm:text-4xl">{cart.data.name}</h1>
      <div className="mt-8">
        {!cart.data.items?.length ? (
          <EmptyState
            title="This cart is empty"
            action={
              <Link className="text-herb-700 underline" to="/recipes">
                Choose a recipe
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {cart.data.items.map((item) => (
              <li className="card flex items-center gap-3" key={item.id}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  aria-label={`Mark ${item.name} complete`}
                />
                <span className="flex-1 font-semibold">{item.name}</span>
                <span className="text-slate-500">
                  {item.quantity} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function CartPage() {
  const { id } = useParams();
  return id ? <CartDetail id={id} /> : <CartList />;
}
