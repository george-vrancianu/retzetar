import { Button, Card, FlexCol, FlexRow, List, Text } from "@retzetar/ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/QueryState.tsx";
import { usePantry } from "../hooks/usePantry.ts";
import { expiryLabel } from "../utils/expiryLabel.ts";

export function PantryContent() {
  const { pantry, removeItem } = usePantry();

  if (pantry.isPending) return <LoadingState label="Opening pantry" />;
  if (pantry.isError) {
    return (
      <ErrorState
        message="Your pantry could not be loaded."
        retry={() => void pantry.refetch()}
      />
    );
  }
  if (pantry.data.length === 0) {
    return <EmptyState title="Your pantry is empty" />;
  }

  return (
    <List variant="stack">
      {pantry.data.map((item) => (
        <Card as="li" key={item.id}>
          <FlexRow align="between" gap="lg">
            <FlexCol gap="none">
              <Text sx={{ fontWeight: 700 }}>{item.name}</Text>
              <Text variant="subtle">Category: {item.category}</Text>
              {item.name !== item.ingredientName && (
                <Text variant="subtle">
                  Ingredient: {item.ingredientName}
                </Text>
              )}
              <Text variant="subtle">
                {item.quantity} {item.unit}
              </Text>
              {item.expiresAt && (
                <Text sx={{ mt: 0.5 }} variant="subtle">
                  {expiryLabel(item.expiresAt)}
                </Text>
              )}
            </FlexCol>
            <Button
              type="button"
              variant="danger"
              sx={{ fontSize: "0.875rem" }}
              disabled={removeItem.isPending}
              onClick={() => removeItem.mutate(item.id)}
            >
              Remove
            </Button>
          </FlexRow>
        </Card>
      ))}
    </List>
  );
}
