import {
  ActionLink,
  Alert,
  Button,
  Card,
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
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/QueryState.tsx";
import { useCartList } from "../hooks/useCartList.ts";

export function CartList() {
  const { carts, createCart, name, setName, submit } = useCartList();

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
            disabled={createCart.isPending}
          >
            Create cart
          </Button>
          {createCart.isError && (
            <Alert sx={{ mt: 1.5 }}>Could not create the cart.</Alert>
          )}
        </Card>
      </Grid>
    </Page>
  );
}
