/// <reference types="vitest/config" />

import { retzetarUi } from "@retzetar/ui/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), retzetarUi()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
