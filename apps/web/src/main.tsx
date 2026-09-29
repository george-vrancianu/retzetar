import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RetzetarUiProvider } from "@retzetar/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RetzetarUiProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RetzetarUiProvider>
    </QueryClientProvider>
  </StrictMode>,
);
