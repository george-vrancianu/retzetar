import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client.ts";

const navigation = [
  ["Dashboard", "/dashboard"],
  ["Recipes", "/recipes"],
  ["Pantry", "/pantry"],
  ["Favorites", "/favorites"],
  ["Cart", "/carts"],
  ["Settings", "/settings"],
] as const;

export function AppLayout() {
  const session = authClient.useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await authClient.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-herb-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/recipes"
            className="text-2xl font-black tracking-tight text-herb-700"
          >
            Retzetar
          </Link>
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto"
          >
            {navigation
              .filter(([, path]) => session.data || path === "/recipes")
              .map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? "bg-herb-100 text-herb-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
          </nav>
          <div className="order-2 sm:order-3">
            {session.data ? (
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 hover:text-herb-700"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            ) : (
              <Link className="btn-primary" to="/auth">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
