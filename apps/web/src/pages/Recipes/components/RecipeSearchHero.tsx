import {
  Button,
  Card,
  Form,
  Heading,
  Input,
  Text,
  VisuallyHidden,
} from "@retzetar/ui";
import type { RecipeSearchController } from "../hooks/useRecipeSearch.ts";

export function RecipeSearchHero({
  controller,
}: {
  controller: RecipeSearchController;
}) {
  return (
    <Card variant="hero">
      <Text variant="eyebrow">Cook with confidence</Text>
      <Heading variant="display" sx={{ mt: 1, maxWidth: 672 }}>
        Find your next recipe
      </Heading>
      <Form
        spacing="none"
        sx={{
          mt: 3,
          maxWidth: 576,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
        }}
        role="search"
        onSubmit={controller.submit}
      >
        <VisuallyHidden as="label" htmlFor="recipe-search">
          Search recipes
        </VisuallyHidden>
        <Input
          id="recipe-search"
          sx={{
            color: "text.primary",
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
          type="search"
          placeholder="Try pasta, soup, or quick dinner"
          value={controller.input}
          onChange={(event) => controller.setInput(event.target.value)}
        />
        <Button variant="secondary" type="submit">
          Search
        </Button>
      </Form>
    </Card>
  );
}
