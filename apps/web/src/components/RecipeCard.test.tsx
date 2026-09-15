import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RecipeCard } from "./RecipeCard.tsx";

const recipe = {
  id: "recipe-1",
  title: "Garden soup",
  description: "A quick seasonal soup.",
  imageUrl: null,
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 20,
  tags: [],
  dietTypes: [
    { id: "diet-vegetarian", name: "Vegetarian" },
    { id: "diet-vegan", name: "Vegan" },
  ],
};

describe("RecipeCard", () => {
  it("shows useful recipe information and links to details", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Garden soup" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Garden soup" })).toHaveAttribute(
      "href",
      "/recipes/recipe-1",
    );
    expect(screen.getByText("30 min · 4 servings")).toBeInTheDocument();
    expect(screen.getByText("Vegetarian · Vegan")).toBeInTheDocument();
  });
});
