const apiOrigin = (
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`
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

export type ReferenceItem = { id: string; name: string };

export type Recipe = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  tags: string[];
  dietTypes: ReferenceItem[];
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
  ingredientName: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiresAt: string | null;
};

export type ProductScanResult = {
  productName: string;
  productType: string;
  matchedIngredientId: string | null;
  matchedIngredientName: string | null;
  matchedIngredientDefaultUnit: string | null;
  matchedCategory: string | null;
  matchConfidence: number;
  fallbackIngredientName: string;
  expiryDate: string | null;
  expiryText: string | null;
  confidence: number;
};

export type ReceiptScanLineType =
  | "product"
  | "discount"
  | "fee"
  | "deposit"
  | "subtotal"
  | "tax"
  | "total"
  | "payment"
  | "other";

export type ReceiptScanQuantityType = "count" | "package_size" | "measured";

export type ReceiptScanResult = {
  merchantName: string | null;
  purchaseDate: string | null;
  lines: Array<{
    lineNumber: number;
    sourceText: string;
    lineType: ReceiptScanLineType;
    includeInPantry: boolean;
    exclusionReason: string | null;
    productName: string | null;
    productType: string | null;
    matchedIngredientId: string | null;
    matchedIngredientName: string | null;
    matchedIngredientDefaultUnit: string | null;
    matchedCategory: string | null;
    matchConfidence: number;
    fallbackIngredientName: string | null;
    matchExplanation: string;
    quantityType: ReceiptScanQuantityType | null;
    purchasedCount: number | null;
    quantityPerItem: number | null;
    quantityUnit: string | null;
    quantity: number | null;
    unit: string | null;
    confidence: number;
  }>;
  items: Array<{
    lineNumber: number;
    sourceText: string;
    productName: string;
    productType: string;
    matchedIngredientId: string | null;
    matchedIngredientName: string | null;
    matchedIngredientDefaultUnit: string | null;
    matchedCategory: string | null;
    matchConfidence: number;
    fallbackIngredientName: string;
    matchExplanation: string;
    quantityType: ReceiptScanQuantityType | null;
    purchasedCount: number | null;
    quantityPerItem: number | null;
    quantityUnit: string | null;
    quantity: number | null;
    unit: string | null;
    confidence: number;
  }>;
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
  role: "admin" | "regular";
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  locale: string;
  dietary: {
    preferredDietTypes: ReferenceItem[];
    allergicIngredients: ReferenceItem[];
    dislikedIngredients: ReferenceItem[];
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
    dietary?: {
      preferredDietTypeIds?: string[];
      allergicIngredientIds?: string[];
      dislikedIngredientIds?: string[];
    };
  }) =>
    request<UserProfile>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  dietTypes: () => request<ReferenceItem[]>("/diet-types"),
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
    name?: string | null;
    quantity: number;
    unit: string;
    expiresAt?: string | null;
  }) =>
    request<PantryItem>("/pantry", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  scanProduct: (input: { productImage: string; expiryImage?: string | null }) =>
    request<ProductScanResult>("/pantry/scan-product", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  scanReceipt: (input: { receiptImage: string }) =>
    request<ReceiptScanResult>("/pantry/scan-receipt", {
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
  adminIngredientCategories: () =>
    request<Array<{ id: string; name: string }>>(
      "/admin/ingredients/categories",
    ),
  createAdminIngredientCategory: (name: string) =>
    request<{ id: string; name: string }>("/admin/ingredients/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  adminIngredients: (q: string) =>
    request<
      Array<{
        id: string;
        name: string;
        defaultUnit: string;
        categoryId: string;
        category: string;
      }>
    >(`/admin/ingredients?q=${encodeURIComponent(q)}`),
  createAdminIngredient: (input: {
    name: string;
    defaultUnit: string;
    categoryId?: string;
  }) =>
    request<{
      id: string;
      name: string;
      defaultUnit: string;
      categoryId: string;
      category: string;
    }>("/admin/ingredients", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateAdminIngredient: (
    id: string,
    input: { name: string; defaultUnit: string; categoryId?: string },
  ) =>
    request(`/admin/ingredients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  removeAdminIngredient: (id: string) =>
    request<{ id: string }>(`/admin/ingredients/${id}`, {
      method: "DELETE",
    }),
};
