const apiOrigin = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiOrigin}/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(
      body?.message ?? `Request failed (${response.status})`,
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

export type Recipe = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  tags: string[];
};

export type RecipeDetail = Recipe & {
  ingredients: Array<{
    id: string;
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
    note: string | null;
    position: number;
  }>;
  steps: Array<{
    id: string;
    position: number;
    instruction: string;
    durationMinutes: number | null;
  }>;
};

export type PantryItem = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  expiresAt: string | null;
};

export type Cart = {
  id: string;
  name: string;
  status: string;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
  }>;
};

export type WidgetType =
  "pantry-summary" | "recommended-recipes" | "favorites" | "active-cart";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  locale: string;
  dietary: {
    diets: string[];
    allergens: string[];
    dislikedIngredients: string[];
  };
};

export type DashboardConfiguration = {
  id?: string;
  type: WidgetType;
  position: number;
  enabled: boolean;
  settings: Record<string, string | number | boolean>;
};

export type Dashboard = {
  registry: Array<{ type: WidgetType; title: string; description: string }>;
  configurations: DashboardConfiguration[];
};

export const api = {
  profile: () => request<UserProfile>("/users/me"),
  updateProfile: (input: {
    displayName?: string | null;
    bio?: string | null;
    locale?: string;
    dietary?: Partial<UserProfile["dietary"]>;
  }) =>
    request<UserProfile>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  recipes: (q = "", page = 1, limit = 12) =>
    request<{
      items: Recipe[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/recipes?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
  recipe: (id: string) => request<RecipeDetail>(`/recipes/${id}`),
  ingredients: (q: string) =>
    request<Array<{ id: string; name: string; defaultUnit: string }>>(
      `/ingredients?q=${encodeURIComponent(q)}`,
    ),
  pantry: () => request<PantryItem[]>("/pantry"),
  addPantry: (input: {
    ingredientId: string;
    quantity: number;
    unit: string;
  }) =>
    request<PantryItem>("/pantry", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  removePantry: (id: string) =>
    request<{ id: string }>(`/pantry/${id}`, { method: "DELETE" }),
  favorites: () =>
    request<Array<{ recipe: Recipe; favoritedAt: string }>>("/favorites"),
  addFavorite: (recipeId: string) =>
    request(`/favorites/${recipeId}`, { method: "POST" }),
  removeFavorite: (recipeId: string) =>
    request(`/favorites/${recipeId}`, { method: "DELETE" }),
  dashboard: () => request<Dashboard>("/dashboard"),
  saveDashboardLayout: (configurations: DashboardConfiguration[]) =>
    request<Dashboard>("/dashboard/layout", {
      method: "PUT",
      body: JSON.stringify({
        configurations: configurations.map(
          ({ type, position, enabled, settings }) => ({
            type,
            position,
            enabled,
            settings,
          }),
        ),
      }),
    }),
  carts: () => request<Cart[]>("/carts"),
  cart: (id: string) => request<Cart>(`/carts/${id}`),
  createCart: (name: string) =>
    request<Cart>("/carts", { method: "POST", body: JSON.stringify({ name }) }),
  addMissing: (cartId: string, recipeId: string) =>
    request<{
      added: Array<{ name: string; quantity: number; unit: string }>;
      cart: Cart;
    }>(`/carts/${cartId}/recipes/${recipeId}/missing-ingredients`, {
      method: "POST",
    }),
};
