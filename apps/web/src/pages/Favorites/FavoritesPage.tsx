import { Heading, Page, Section, Text } from "@retzetar/ui";
import { FavoritesContent } from "./components/FavoritesContent.tsx";

export function FavoritesPage() {
  return (
    <Page>
      <Heading>Favorite recipes</Heading>
      <Text sx={{ mt: 1 }} variant="muted">
        Your saved ideas, ready when you are.
      </Text>
      <Section spacing="lg">
        <FavoritesContent />
      </Section>
    </Page>
  );
}
