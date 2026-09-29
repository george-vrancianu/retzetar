import {
  ActionLink,
  Button,
  Card,
  FlexCol,
  Heading,
  Media,
  Text,
} from "@retzetar/ui";
import { Link } from "react-router-dom";
import type { Recipe } from "../lib/api.ts";

export function RecipeCard({
  recipe,
  favoriteAction,
}: {
  recipe: Recipe;
  favoriteAction?: { label: string; onClick: () => void; pending?: boolean };
}) {
  return (
    <Card
      as="article"
      variant="flush"
      sx={{ display: "flex", height: "100%", flexDirection: "column" }}
    >
      <Media src={recipe.imageUrl} alt="" />
      <FlexCol sx={{ flex: 1, p: 2.5 }}>
        <Heading level={2} variant="card" sx={{ color: "text.primary" }}>
          <ActionLink as={Link} to={`/recipes/${recipe.id}`} variant="title">
            {recipe.title}
          </ActionLink>
        </Heading>
        <Text
          sx={{
            display: "-webkit-box",
            flex: 1,
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
          variant="subtle"
        >
          {recipe.description}
        </Text>
        <Text sx={{ fontWeight: 500 }} variant="subtle">
          {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.servings}{" "}
          servings
        </Text>
        {recipe.dietTypes.length > 0 && (
          <Text variant="small" sx={{ fontWeight: 500, color: "primary.main" }}>
            {recipe.dietTypes.map((dietType) => dietType.name).join(" · ")}
          </Text>
        )}
        {favoriteAction && (
          <Button
            type="button"
            variant="secondary"
            disabled={favoriteAction.pending}
            onClick={favoriteAction.onClick}
          >
            {favoriteAction.label}
          </Button>
        )}
      </FlexCol>
    </Card>
  );
}
