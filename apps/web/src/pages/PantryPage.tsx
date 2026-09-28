import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionLink,
  Button,
  Card,
  FlexCol,
  FlexRow,
  Heading,
  List,
  Page,
  PageHeader,
  Section,
  Text,
} from "@retzetar/ui";
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";

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
  const pantry = useQuery({ queryKey: ["pantry"], queryFn: api.pantry });
  const remove = useMutation({
    mutationFn: api.removePantry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantry"] }),
  });

  return (
    <Page>
      <PageHeader className="items-center">
        <Heading>Your pantry</Heading>
        <ActionLink as={Link} to="/pantry/add" variant="primary">
          + Add ingredients
        </ActionLink>
      </PageHeader>
      <Text className="mt-2" variant="muted">
        Track ingredients and their expiry dates so carts only include what is
        missing.
      </Text>
      <Section spacing="lg">
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
    </Page>
  );
}
