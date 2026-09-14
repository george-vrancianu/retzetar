import { beforeEach, describe, expect, it } from "vitest";
import { useDashboardLayoutStore } from "./dashboard-layout-store.ts";

const initial = [
  { type: "favorites" as const, position: 0, enabled: true, settings: {} },
  { type: "pantry-summary" as const, position: 1, enabled: true, settings: {} },
];
const available = ["favorites", "pantry-summary", "active-cart"] as const;

describe("dashboard layout store", () => {
  beforeEach(() => {
    useDashboardLayoutStore.getState().hydrate(initial, [...available]);
  });

  it("adds newly registered widgets as disabled layout options", () => {
    const activeCart = useDashboardLayoutStore
      .getState()
      .draft.find(({ type }) => type === "active-cart");
    expect(activeCart).toMatchObject({ enabled: false, position: 2 });
  });

  it("edits, reorders, and cancels without changing the server baseline", () => {
    const store = useDashboardLayoutStore.getState();
    store.beginEditing();
    store.toggleWidget("active-cart");
    store.moveWidget("active-cart", -1);

    expect(useDashboardLayoutStore.getState()).toMatchObject({
      editing: true,
      dirty: true,
    });
    expect(useDashboardLayoutStore.getState().draft[1]).toMatchObject({
      type: "active-cart",
      enabled: true,
    });

    useDashboardLayoutStore.getState().cancelEditing();
    expect(useDashboardLayoutStore.getState()).toMatchObject({
      editing: false,
      dirty: false,
    });
    expect(useDashboardLayoutStore.getState().draft[2]).toMatchObject({
      type: "active-cart",
      enabled: false,
    });
  });
});
