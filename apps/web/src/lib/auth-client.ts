import { createAuthClient } from "better-auth/react";

const apiOrigin = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const authClient = createAuthClient({
  baseURL: apiOrigin,
  basePath: "/api/auth",
});
