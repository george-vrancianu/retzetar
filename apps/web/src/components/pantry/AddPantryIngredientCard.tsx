import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Form,
  FormField,
  Grid,
  Heading,
  Input,
  SearchCombobox,
  Text,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import { api } from "../../lib/api.ts";

type IngredientSelection = {
  id: string;
  name: string;
  defaultUnit: string;
};

export type AddPantryIngredientValues = {
  ingredientQuery?: string;
  quantity?: number;
  unit?: string;
  expiresOn?: string;
};

type AddPantryIngredientCardProps = {
  title?: string;
  description?: string;
  initialValues?: AddPantryIngredientValues;
  onAdded?: () => void;
  onDiscard?: () => void;
};

export function AddPantryIngredientCard({
  title = "Add an ingredient",
  description,
  initialValues = {},
  onAdded,
  onDiscard,
}: AddPantryIngredientCardProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(initialValues.ingredientQuery ?? "");
  const [selected, setSelected] = useState<IngredientSelection | null>(null);
  const [quantity, setQuantity] = useState(
    String(initialValues.quantity ?? 1),
  );
  const [unit, setUnit] = useState(initialValues.unit ?? "");
  const [expiresOn, setExpiresOn] = useState(initialValues.expiresOn ?? "");
  const profile = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  const isAdmin = profile.data?.role === "admin";
  const ingredients = useQuery({
    queryKey: ["ingredients", search],
    queryFn: () => api.ingredients(search),
    enabled: search.trim().length >= 2,
  });
  const exactMatch = ingredients.data?.find(
    (ingredient) =>
      ingredient.name.trim().toLocaleLowerCase() ===
      search.trim().toLocaleLowerCase(),
  );
  const add = useMutation({
    mutationFn: async () => {
      let ingredient = selected ?? exactMatch ?? null;

      if (!ingredient) {
        if (!isAdmin) throw new Error("Select an ingredient from the catalog");
        const created = await api.createAdminIngredient({
          name: search.trim(),
          defaultUnit: unit.trim(),
        });
        ingredient = created;
        setSelected(created);
        setSearch(created.name);
        await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      }

      return api.addPantry({
        ingredientId: ingredient.id,
        quantity: Number(quantity),
        unit: unit.trim(),
        expiresAt: expiresOn
          ? new Date(`${expiresOn}T12:00:00.000Z`).toISOString()
          : null,
      });
    },
    onSuccess: async () => {
      onAdded?.();
      if (!onAdded) {
        setSelected(null);
        setSearch("");
        setQuantity("1");
        setUnit("");
        setExpiresOn("");
      }
      await queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected && !isAdmin) return;
    add.mutate();
  };

  const canSubmitWithoutSelection =
    isAdmin && !selected && search.trim().length > 0 && unit.trim().length > 0;
  const willCreateIngredient = canSubmitWithoutSelection && !exactMatch;

  return (
    <Card as={Form} onSubmit={submit}>
      <Heading level={2} variant="card">
        {title}
      </Heading>
      {description && (
        <Text className="mt-2" variant="subtle">
          {description}
        </Text>
      )}
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
          setUnit((current) => current || ingredient.defaultUnit);
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
      <FormField label="Expiry date (optional)" className="mt-4">
        <Input
          type="date"
          value={expiresOn}
          onChange={(event) => setExpiresOn(event.target.value)}
        />
      </FormField>
      <Grid variant="fields" className="mt-4">
        <Button
          block
          type="submit"
          disabled={
            (!selected && !canSubmitWithoutSelection) ||
            !unit.trim() ||
            Number(quantity) <= 0 ||
            add.isPending
          }
        >
          {add.isPending
            ? willCreateIngredient
              ? "Creating and adding…"
              : "Adding…"
            : willCreateIngredient
              ? "Create and add to pantry"
              : "Add to pantry"}
        </Button>
        {onDiscard && (
          <Button
            block
            type="button"
            variant="secondary"
            disabled={add.isPending}
            onClick={onDiscard}
          >
            Discard
          </Button>
        )}
      </Grid>
      {add.isError && (
        <Alert className="mt-3">
          {willCreateIngredient
            ? "The ingredient could not be created and added. Check the name and try again."
            : "This ingredient could not be added. Check for a duplicate and try again."}
        </Alert>
      )}
      {isAdmin && !selected && search.trim() && (
        <Text className="mt-3" variant="subtle">
          {exactMatch
            ? `Submitting will add the existing “${exactMatch.name}” catalog ingredient.`
            : `Submitting will create “${search.trim()}” with ${
                unit.trim() || "the entered unit"
              } first.`}
        </Text>
      )}
    </Card>
  );
}
