import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  FlexCol,
  FlexRow,
  Grid,
  Heading,
  List,
  Page,
  Section,
  Text,
} from "@retzetar/ui";
import { AddPantryIngredientCard } from "../components/pantry/AddPantryIngredientCard.tsx";
import { PantryScanPanel } from "../components/pantry/PantryScanPanel.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";
import { useScannedIngredientsStore } from "../stores/scanned-ingredients-store.ts";

function expiryLabel(expiresAt: string) {
  const date = new Date(expiresAt);
  const formatted = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return `Expired · ${formatted}`;
  if (days <= 3) return `Expires soon · ${formatted}`;
  return `Expires ${formatted}`;
}

export function PantryPage() {
  const queryClient = useQueryClient();
  const scannedIngredients = useScannedIngredientsStore(
    (state) => state.ingredients,
  );
  const removeScannedIngredient = useScannedIngredientsStore(
    (state) => state.removeIngredient,
  );
  const pantry = useQuery({ queryKey: ["pantry"], queryFn: api.pantry });
  const remove = useMutation({
    mutationFn: api.removePantry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantry"] }),
  });

  return (
    <Page>
      <Heading>Your pantry</Heading>
      <Text className="mt-2" variant="muted">
        Track ingredients and their expiry dates so carts only include what is
        missing.
      </Text>
      <Grid variant="sidebar" className="mt-8">
        <Section>
          {pantry.isPending ? (
            <LoadingState label="Opening pantry" />
          ) : pantry.isError ? (
            <ErrorState
              message="Your pantry could not be loaded."
              retry={() => void pantry.refetch()}
            />
          ) : pantry.data.length === 0 ? (
            <EmptyState title="Your pantry is empty" />
          ) : (
            <List variant="stack">
              {pantry.data.map((item) => (
                <Card as="li" key={item.id}>
                  <FlexRow align="between" gap="lg">
                    <FlexCol gap="none">
                      <Text className="font-bold">{item.name}</Text>
                      <Text variant="subtle">
                        {item.quantity} {item.unit}
                      </Text>
                      {item.expiresAt && (
                        <Text className="mt-1" variant="subtle">
                          {expiryLabel(item.expiresAt)}
                        </Text>
                      )}
                    </FlexCol>
                    <Button
                      type="button"
                      variant="danger"
                      className="text-sm"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(item.id)}
                    >
                      Remove
                    </Button>
                  </FlexRow>
                </Card>
              ))}
            </List>
          )}
        </Section>
        <FlexCol gap="lg">
          <PantryScanPanel />
          {scannedIngredients.length > 0 && (
            <Section>
              <Heading level={2} variant="section">
                Scanned ingredients ({scannedIngredients.length})
              </Heading>
              <Text className="mt-2" variant="subtle">
                Confirm the matching catalog ingredient, adjust its values, and
                add each item to your pantry.
              </Text>
              <FlexCol className="mt-4" gap="lg">
                {scannedIngredients.map((ingredient) => (
                  <AddPantryIngredientCard
                    key={ingredient.id}
                    title={ingredient.productName}
                    description={`${
                      ingredient.source === "receipt"
                        ? "Receipt item"
                        : "Product scan"
                    } · ${ingredient.productType} · ${Math.round(
                      ingredient.confidence * 100,
                    )}% confidence`}
                    initialValues={{
                      ingredientQuery: ingredient.ingredientQuery,
                      quantity: ingredient.quantity,
                      unit: ingredient.unit,
                      expiresOn: ingredient.expiresOn,
                    }}
                    onAdded={() => removeScannedIngredient(ingredient.id)}
                    onDiscard={() => removeScannedIngredient(ingredient.id)}
                  />
                ))}
              </FlexCol>
            </Section>
          )}
          <AddPantryIngredientCard />
        </FlexCol>
      </Grid>
    </Page>
  );
}
