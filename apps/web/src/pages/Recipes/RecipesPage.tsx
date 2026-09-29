import { Page, Section } from "@retzetar/ui";
import { RecipeResults } from "./components/RecipeResults.tsx";
import { RecipeSearchHero } from "./components/RecipeSearchHero.tsx";
import { useRecipeSearch } from "./hooks/useRecipeSearch.ts";

export function RecipesPage() {
  const controller = useRecipeSearch();

  return (
    <Page>
      <RecipeSearchHero controller={controller} />
      <Section spacing="lg">
        <RecipeResults controller={controller} />
      </Section>
    </Page>
  );
}
