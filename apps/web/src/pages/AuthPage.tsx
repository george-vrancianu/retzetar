import {
  ActionLink,
  Alert,
  Button,
  Card,
  CenteredLayout,
  Form,
  FormField,
  Heading,
  Input,
  Text,
} from "@retzetar/ui";
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
    <CenteredLayout>
      <Card
        as="section"
        className="w-full max-w-md p-8"
        aria-labelledby="auth-title"
      >
        <ActionLink as={Link} to="/recipes">
          ← Browse recipes
        </ActionLink>
        <Heading id="auth-title" className="mt-6">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </Heading>
        <Text className="mt-2" variant="muted">
          Plan meals around what you already have.
        </Text>
        {error && <Alert className="mt-4">{error}</Alert>}
        <Form className="mt-6" onSubmit={(event) => void submit(event)}>
          {mode === "sign-up" && (
            <FormField label="Name">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />
            </FormField>
          )}
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </FormField>
          <FormField label="Password">
            <Input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
            />
          </FormField>
          <Button block disabled={pending} type="submit">
            {pending
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Sign up"}
          </Button>
        </Form>
        <Button
          type="button"
          variant="text"
          block
          className="mt-5 text-sm"
          onClick={() => {
            setError("");
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          }}
        >
          {mode === "sign-in"
            ? "Need an account? Sign up"
            : "Already registered? Sign in"}
        </Button>
      </Card>
    </CenteredLayout>
  );
}
