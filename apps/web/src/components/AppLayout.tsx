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
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useMatch, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client.ts";
import { api } from "../lib/api.ts";

const navigation = [
  ["Dashboard", "/dashboard"],
  ["Recipes", "/recipes"],
  ["Pantry", "/pantry"],
  ["Favorites", "/favorites"],
  ["Cart", "/carts"],
  ["Settings", "/settings"],
] as const;

export function AppLayout() {
  const addingIngredients = useMatch("/pantry/add");
  const session = authClient.useSession();
  const navigate = useNavigate();
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile,
    enabled: Boolean(session.data),
  });
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
            sx={{
              order: { xs: 3, sm: 2 },
              width: { xs: "100%", sm: "auto" },
              overflowX: "auto",
            }}
          >
            {navigation
              .filter(([, path]) => session.data || path === "/recipes")
              .map(([label, path]) => (
                <ActionLink as={NavLink} key={path} to={path} variant="nav">
                  {label}
                </ActionLink>
              ))}
            {profile.data?.role === "admin" && (
              <ActionLink as={NavLink} to="/admin" variant="nav">
                Admin
              </ActionLink>
            )}
          </Navigation>
          <FlexRow sx={{ order: { xs: 2, sm: 3 } }}>
            {session.data ? (
              <Button
                type="button"
                variant="text"
                sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
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
      <AppMain wide={Boolean(addingIngredients)}>
        <Outlet />
      </AppMain>
    </AppShell>
  );
}
