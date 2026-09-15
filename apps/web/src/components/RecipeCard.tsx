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
    <Card as="article" variant="flush" className="flex h-full flex-col">
      <Media src={recipe.imageUrl} alt="" />
      <FlexCol className="flex-1 p-5">
        <Heading level={2} variant="card" className="text-slate-900">
          <ActionLink as={Link} to={`/recipes/${recipe.id}`} variant="title">
            {recipe.title}
          </ActionLink>
        </Heading>
        <Text className="line-clamp-3 flex-1" variant="subtle">
          {recipe.description}
        </Text>
        <Text className="font-medium" variant="subtle">
          {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.servings}{" "}
          servings
        </Text>
        {recipe.dietTypes.length > 0 && (
          <Text variant="small" className="font-medium text-herb-700">
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
