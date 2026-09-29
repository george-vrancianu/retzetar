import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionLink,
  Alert,
  Button,
  Card,
  Checkbox,
  FlexRow,
  Form,
  FormField,
  Grid,
  Heading,
  Input,
  List,
  Page,
  Section,
  Text,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";
import { CartPlateScan } from "../components/carts/CartPlateScan.tsx";

function CartList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("Weekly groceries");
  const carts = useQuery({ queryKey: ["carts"], queryFn: api.carts });
  const create = useMutation({
    mutationFn: () => api.createCart(name),
    onSuccess: async (cart) => {
      await queryClient.invalidateQueries({ queryKey: ["carts"] });
      navigate(`/carts/${cart.id}`);
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <Page>
      <Heading>Shopping carts</Heading>
      <Grid variant="sidebar" sx={{ mt: 4 }}>
        <Section>
          {carts.isPending ? (
            <LoadingState />
          ) : carts.isError ? (
            <ErrorState
              message="Carts could not be loaded."
              retry={() => void carts.refetch()}
            />
          ) : carts.data.length === 0 ? (
            <EmptyState title="No carts yet" />
          ) : (
            <List variant="stack">
              {carts.data.map((cart) => (
                <Card as="li" key={cart.id}>
                  <ActionLink
                    as={Link}
                    sx={{ fontSize: "1.125rem" }}
                    to={`/carts/${cart.id}`}
                    variant="title"
                  >
                    {cart.name}
                  </ActionLink>
                  <Text sx={{ textTransform: "capitalize" }} variant="subtle">
                    {cart.status}
                  </Text>
                </Card>
              ))}
            </List>
          )}
        </Section>
        <Card as={Form} onSubmit={submit}>
          <Heading level={2} variant="card">
            New cart
          </Heading>
          <FormField sx={{ mt: 2 }} label="Name">
            <Input
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </FormField>
          <Button
            sx={{ mt: 2 }}
            block
            type="submit"
            disabled={create.isPending}
          >
            Create cart
          </Button>
          {create.isError && (
            <Alert sx={{ mt: 1.5 }}>Could not create the cart.</Alert>
          )}
        </Card>
      </Grid>
    </Page>
  );
}

function CartDetail({ id }: { id: string }) {
  const cart = useQuery({
    queryKey: ["cart", id],
    queryFn: () => api.cart(id),
  });
  if (cart.isPending) return <LoadingState label="Loading cart" />;
  if (cart.isError)
    return (
      <ErrorState
        message="This cart could not be loaded."
        retry={() => void cart.refetch()}
      />
    );
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

export function CartPage() {
  const { id } = useParams();
  return id ? <CartDetail id={id} /> : <CartList />;
}
