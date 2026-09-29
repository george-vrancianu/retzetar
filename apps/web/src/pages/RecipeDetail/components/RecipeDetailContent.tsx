import {
  ActionLink,
  Alert,
  Button,
  Card,
  FlexCol,
  FlexRow,
  FormField,
  Grid,
  Heading,
  List,
  ListItem,
  Media,
  Option,
  Page,
  Section,
  Select,
  Status,
  Text,
} from "@retzetar/ui";
import { Link } from "react-router-dom";
import { ErrorState, LoadingState } from "../../../components/QueryState.tsx";
import { useRecipeDetail } from "../hooks/useRecipeDetail.ts";

export function RecipeDetailContent() {
  const {
    addMissing,
    cartId,
    carts,
    favorite,
    recipe,
    session,
    setCartId,
  } = useRecipeDetail();

  if (recipe.isPending) return <LoadingState label="Loading recipe" />;
  if (recipe.isError)
    return (
      <ErrorState
        message="That recipe could not be loaded."
        retry={() => void recipe.refetch()}
      />
    );

  return (
    <Page as="article">
      <ActionLink as={Link} to="/recipes">
        ← All recipes
      </ActionLink>
      <Grid variant="detail" sx={{ mt: 2.5 }}>
        <Section>
          {recipe.data.imageUrl && (
            <Media variant="detail" src={recipe.data.imageUrl} alt="" />
          )}
          <Heading sx={{ mt: 3 }} variant="display">
            {recipe.data.title}
          </Heading>
          <Text sx={{ mt: 1.5, fontSize: "1.125rem" }} variant="muted">
            {recipe.data.description}
          </Text>
          <Section spacing="lg">
            <Heading level={2} variant="section">
              Method
            </Heading>
            <List ordered variant="stack" sx={{ mt: 2, pl: 2.5 }}>
              {recipe.data.steps.map((step) => (
                <Card as="li" key={step.id}>
                  <FlexRow align="start" gap="lg">
                    <Text
                      as="span"
                      sx={{ fontWeight: 900, color: "primary.main" }}
                    >
                      {step.position}
                    </Text>
                    <Text>{step.instruction}</Text>
                  </FlexRow>
                </Card>
              ))}
            </List>
          </Section>
        </Section>
        <FlexCol as="aside" gap="lg">
          <Card as="section">
            <Heading level={2} variant="card">
              Ingredients
            </Heading>
            <List variant="compact" sx={{ mt: 2 }}>
              {recipe.data.ingredients.map((item) => (
                <ListItem key={item.id}>
                  <FlexRow align="between">
                    <Text as="span">{item.name}</Text>
                    <Text as="span" variant="muted">
                      {item.quantity} {item.unit}
                    </Text>
                  </FlexRow>
                </ListItem>
              ))}
            </List>
          </Card>
          {session.data ? (
            <Card as="section">
              <FlexCol>
                <Button
                  block
                  variant="secondary"
                  type="button"
                  disabled={favorite.isPending}
                  onClick={() => favorite.mutate()}
                >
                  {favorite.isSuccess ? "Saved!" : "Save favorite"}
                </Button>
                {carts.data && carts.data.length > 0 ? (
                  <>
                    <FormField label="Shopping cart">
                      <Select
                        value={cartId}
                        onChange={(event) => setCartId(event.target.value)}
                      >
                        <Option value="">Choose a cart</Option>
                        {carts.data.map((cart) => (
                          <Option key={cart.id} value={cart.id}>
                            {cart.name}
                          </Option>
                        ))}
                      </Select>
                    </FormField>
                    <Button
                      block
                      type="button"
                      disabled={!cartId || addMissing.isPending}
                      onClick={() => addMissing.mutate()}
                    >
                      Add missing ingredients
                    </Button>
                  </>
                ) : (
                  <ActionLink as={Link} block to="/carts" variant="primary">
                    Create a cart
                  </ActionLink>
                )}
                {addMissing.isSuccess && (
                  <Status>
                    Added {addMissing.data.added.length} missing ingredients.
                  </Status>
                )}
                {(favorite.isError || addMissing.isError) && (
                  <Alert>That action failed. Please try again.</Alert>
                )}
              </FlexCol>
            </Card>
          ) : (
            <ActionLink as={Link} block to="/auth" variant="primary">
              Sign in to save or shop
            </ActionLink>
          )}
        </FlexCol>
      </Grid>
    </Page>
  );
}
