import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout.tsx";
import { RequireAuth } from "./components/RequireAuth.tsx";
import { AdminIngredientsPage } from "./pages/AdminIngredientsPage.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import { CartPage } from "./pages/CartPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { FavoritesPage } from "./pages/FavoritesPage.tsx";
import { PantryPage } from "./pages/PantryPage.tsx";
import { RecipeDetailPage } from "./pages/RecipeDetailPage.tsx";
import { RecipesPage } from "./pages/RecipesPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/recipes" replace />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pantry" element={<PantryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminIngredientsPage />} />
          <Route path="carts/:id?" element={<CartPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/recipes" replace />} />
    </Routes>
  );
}

export default App;
