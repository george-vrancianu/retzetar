import {
  ActionLink,
  Alert,
  Button,
  Card,
  Form,
  FormField,
  Heading,
  Input,
  Text,
} from "@retzetar/ui";
import { Link } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm.ts";

export function AuthCard() {
  const form = useAuthForm();

  return (
    <Card
      as="section"
      sx={{ width: "100%", maxWidth: 448, p: 4 }}
      aria-labelledby="auth-title"
    >
      <ActionLink as={Link} to="/recipes">
        ← Browse recipes
      </ActionLink>
      <Heading id="auth-title" sx={{ mt: 3 }}>
        {form.mode === "sign-in" ? "Welcome back" : "Create your account"}
      </Heading>
      <Text sx={{ mt: 1 }} variant="muted">
        Plan meals around what you already have.
      </Text>
      {form.error && <Alert sx={{ mt: 2 }}>{form.error}</Alert>}
      <Form sx={{ mt: 3 }} onSubmit={(event) => void form.submit(event)}>
        {form.mode === "sign-up" && (
          <FormField label="Name">
            <Input
              value={form.name}
              onChange={(event) => form.setName(event.target.value)}
              required
              autoComplete="name"
            />
          </FormField>
        )}
        <FormField label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => form.setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </FormField>
        <FormField label="Password">
          <Input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => form.setPassword(event.target.value)}
            required
            autoComplete={
              form.mode === "sign-in" ? "current-password" : "new-password"
            }
          />
        </FormField>
        <Button block disabled={form.pending} type="submit">
          {form.pending
            ? "Please wait…"
            : form.mode === "sign-in"
              ? "Sign in"
              : "Sign up"}
        </Button>
      </Form>
      <Button
        type="button"
        variant="text"
        block
        sx={{ mt: 2.5, fontSize: "0.875rem" }}
        onClick={form.toggleMode}
      >
        {form.mode === "sign-in"
          ? "Need an account? Sign up"
          : "Already registered? Sign in"}
      </Button>
    </Card>
  );
}
