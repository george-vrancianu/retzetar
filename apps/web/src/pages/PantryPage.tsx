import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  FlexCol,
  FlexRow,
  Form,
  FormField,
  Grid,
  Heading,
  Input,
  List,
  Page,
  SearchCombobox,
  Section,
  Text,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";

export function PantryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    defaultUnit: string;
  } | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const pantry = useQuery({ queryKey: ["pantry"], queryFn: api.pantry });
  const ingredients = useQuery({
    queryKey: ["ingredients", search],
    queryFn: () => api.ingredients(search),
    enabled: search.trim().length >= 2,
  });
  const add = useMutation({
    mutationFn: api.addPantry,
    onSuccess: async () => {
      setSelected(null);
      setSearch("");
      setQuantity("1");
      await queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });
  const remove = useMutation({
    mutationFn: api.removePantry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pantry"] }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    add.mutate({ ingredientId: selected.id, quantity: Number(quantity), unit });
  };

  return (
    <Page>
      <Heading>Your pantry</Heading>
      <Text className="mt-2" variant="muted">
        Track ingredients so carts only include what is missing.
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
        <Card as={Form} onSubmit={submit}>
          <Heading level={2} variant="card">
            Add an ingredient
          </Heading>
          <SearchCombobox
            className="mt-4"
            label="Find ingredient"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setSelected(null);
            }}
            options={
              selected
                ? []
                : (ingredients.data ?? []).map((ingredient) => ({
                    id: ingredient.id,
                    label: ingredient.name,
                  }))
            }
            onSelect={(option) => {
              const ingredient = ingredients.data?.find(
                (item) => item.id === option.id,
              );
              if (!ingredient) return;
              setSelected(ingredient);
              setSearch(ingredient.name);
              setUnit(ingredient.defaultUnit);
            }}
            placeholder="Type at least 2 letters"
            loading={ingredients.isFetching}
            resultsLabel="Ingredient results"
          />
          <Grid variant="fields" className="mt-4">
            <FormField label="Quantity">
              <Input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
            </FormField>
            <FormField label="Unit">
              <Input
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                required
              />
            </FormField>
          </Grid>
          <Button
            className="mt-4"
            block
            type="submit"
            disabled={!selected || add.isPending}
          >
            {add.isPending ? "Adding…" : "Add to pantry"}
          </Button>
          {(add.isError || remove.isError) && (
            <Alert className="mt-3">
              The pantry could not be updated. Check for a duplicate and try
              again.
            </Alert>
          )}
        </Card>
      </Grid>
    </Page>
  );
}
