import { describe, expect, it } from "vitest";
import { FRONTEND_WIDGET_REGISTRY } from "./widget-registry.tsx";

describe("frontend widget registry", () => {
  it("contains only the supported programmatic widget components", () => {
    expect(Object.keys(FRONTEND_WIDGET_REGISTRY).sort()).toEqual([
      "active-cart",
      "favorites",
      "pantry-summary",
      "recommended-recipes",
    ]);
    expect(
      Object.values(FRONTEND_WIDGET_REGISTRY).every(
        (component) => typeof component === "function",
      ),
    ).toBe(true);
  });
});
