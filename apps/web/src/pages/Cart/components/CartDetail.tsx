import {
  ActionLink,
  Card,
  Checkbox,
  FlexRow,
  Heading,
  List,
  Page,
  Section,
  Text,
} from "@retzetar/ui";
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/QueryState.tsx";
import { useCartDetail } from "../hooks/useCartDetail.ts";
import { CartPlateScan } from "./CartPlateScan.tsx";

export function CartDetail({ id }: { id: string }) {
  const cart = useCartDetail(id);

  if (cart.isPending) return <LoadingState label="Loading cart" />;
  if (cart.isError) {
    return (
      <ErrorState
        message="This cart could not be loaded."
        retry={() => void cart.refetch()}
      />
    );
  }

  return (
    <Page>
      <ActionLink as={Link} to="/carts">
        ← All carts
      </ActionLink>
      <Heading sx={{ mt: 2.5 }}>{cart.data.name}</Heading>
      <CartPlateScan cartId={id} />
      <Section spacing="lg">
        {!cart.data.items?.length ? (
          <EmptyState
            title="This cart is empty"
            action={
              <ActionLink as={Link} to="/recipes">
                Choose a recipe
              </ActionLink>
            }
          />
        ) : (
          <List variant="stack">
            {cart.data.items.map((item) => (
              <Card as="li" key={item.id}>
                <FlexRow>
                  <Checkbox
                    checked={item.checked}
                    readOnly
                    aria-label={`${item.name}, ${item.checked ? "complete" : "not complete"}`}
                  />
                  <Text as="span" sx={{ flex: 1 }} variant="label">
                    {item.name}
                  </Text>
                  <Text as="span" variant="muted">
                    {item.quantity} {item.unit}
                  </Text>
                </FlexRow>
              </Card>
            ))}
          </List>
        )}
      </Section>
    </Page>
  );
}
