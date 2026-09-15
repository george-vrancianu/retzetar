import {
  ActionLink,
  AppHeader,
  AppHeaderInner,
  AppMain,
  AppShell,
  Button,
  FlexRow,
  Navigation,
} from "@retzetar/ui";
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
    <AppShell>
      <AppHeader>
        <AppHeaderInner>
          <ActionLink as={Link} to="/recipes" variant="brand">
            Retzetar
          </ActionLink>
          <Navigation
            aria-label="Main navigation"
            className="order-3 w-full overflow-x-auto sm:order-2 sm:w-auto"
          >
            {navigation
              .filter(([, path]) => session.data || path === "/recipes")
              .map(([label, path]) => (
                <ActionLink as={NavLink} key={path} to={path} variant="nav">
                  {label}
                </ActionLink>
              ))}
          </Navigation>
          <FlexRow className="order-2 sm:order-3">
            {session.data ? (
              <Button
                type="button"
                variant="text"
                className="text-sm text-slate-600 hover:text-herb-700"
                onClick={() => void signOut()}
              >
                Sign out
              </Button>
            ) : (
              <ActionLink as={Link} to="/auth" variant="primary">
                Sign in
              </ActionLink>
            )}
          </FlexRow>
        </AppHeaderInner>
      </AppHeader>
      <AppMain>
        <Outlet />
      </AppMain>
    </AppShell>
  );
}
