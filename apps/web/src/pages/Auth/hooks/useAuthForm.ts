import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authClient } from "../../../lib/auth-client.ts";

export function useAuthForm() {
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

  const toggleMode = () => {
    setError("");
    setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
  };

  return {
    email,
    error,
    mode,
    name,
    password,
    pending,
    setEmail,
    setName,
    setPassword,
    submit,
    toggleMode,
  };
}
