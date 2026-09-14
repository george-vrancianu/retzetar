import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client.ts";

export function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const destination =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password });
    setPending(false);
    if (result.error) {
      setError(
        result.error.message ?? "Authentication failed. Please try again.",
      );
      return;
    }
    navigate(destination, { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-herb-50 px-4 py-12">
      <section
        className="card w-full max-w-md p-8"
        aria-labelledby="auth-title"
      >
        <Link to="/recipes" className="font-bold text-herb-700">
          ← Browse recipes
        </Link>
        <h1 id="auth-title" className="mt-6 text-3xl font-black">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-slate-600">
          Plan meals around what you already have.
        </p>
        {error && (
          <p
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => void submit(event)}
        >
          {mode === "sign-up" && (
            <label className="block font-semibold">
              Name
              <input
                className="field mt-1"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}
          <label className="block font-semibold">
            Email
            <input
              className="field mt-1"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block font-semibold">
            Password
            <input
              className="field mt-1"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
            />
          </label>
          <button
            className="btn-primary w-full"
            disabled={pending}
            type="submit"
          >
            {pending
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Sign up"}
          </button>
        </form>
        <button
          type="button"
          className="mt-5 w-full text-sm font-semibold text-herb-700"
          onClick={() => {
            setError("");
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          }}
        >
          {mode === "sign-in"
            ? "Need an account? Sign up"
            : "Already registered? Sign in"}
        </button>
      </section>
    </main>
  );
}
