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
  FlexRow,
  TableCell,
  TableRow,
} from "@retzetar/ui";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { api } from "../../lib/api.ts";

export type IngredientSelection = {
  id: string;
  name: string;
  defaultUnit: string;
};

export type AddPantryIngredientValues = {
  name?: string;
  ingredientQuery?: string;
  matchedIngredient?: IngredientSelection;
  quantity?: number | null;
  unit?: string;
  expiresOn?: string;
};

type AddPantryIngredientCardProps = {
  layout?: "card" | "row";
  status?: ReactNode;
  category?: string;
  tone?: "matched" | "review" | "unmatched" | "manual";
  requireReview?: boolean;
  title?: string;
  description?: string;
  initialValues?: AddPantryIngredientValues;
  onAdded?: () => void;
  onDiscard?: () => void;
};

export function AddPantryIngredientCard({
  layout = "card",
  status,
  category,
  tone = "manual",
  requireReview = false,
  title = "Add an ingredient",
  description,
  initialValues = {},
  onAdded,
  onDiscard,
}: AddPantryIngredientCardProps) {
  const formId = useId();
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialValues.name ?? "");
  const [search, setSearch] = useState(
    initialValues.matchedIngredient?.name ??
      initialValues.ingredientQuery ??
      "",
  );
  const [selected, setSelected] = useState<IngredientSelection | null>(
    requireReview ? null : (initialValues.matchedIngredient ?? null),
  );
  const [quantity, setQuantity] = useState(
    initialValues.quantity === null ? "" : String(initialValues.quantity ?? 1),
  );
  const [unit, setUnit] = useState(
    initialValues.unit || initialValues.matchedIngredient?.defaultUnit || "",
  );
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
        name: name.trim() || null,
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
        setName("");
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
    if (requireReview && !selected) return;
    if (!selected && !isAdmin) return;
    add.mutate();
  };

  const canSubmitWithoutSelection =
    isAdmin && !selected && search.trim().length > 0 && unit.trim().length > 0;
  const willCreateIngredient = canSubmitWithoutSelection && !exactMatch;

  if (layout === "row") {
    const tones = {
      matched: "bg-herb-50/60",
      review: "bg-amber-50/70",
      unmatched: "bg-slate-50 text-slate-500",
      manual: "bg-white",
    };
    return (
      <TableRow className={tones[tone]} aria-label={title}>
        <TableCell>
          {selected && requireReview ? (
            <Text as="span" variant="success">
              Reviewed
            </Text>
          ) : (
            status
          )}
        </TableCell>
        <TableCell>
          <Input
            className="min-w-36"
            aria-label="Product name"
            form={formId}
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
          />
        </TableCell>
        <TableCell>
          <FlexRow gap="sm">
            <SearchCombobox
              compact
              className="min-w-44 flex-1"
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
              placeholder="Find ingredient"
              loading={ingredients.isFetching}
              resultsLabel="Ingredient results"
            />
            {requireReview &&
              !selected &&
              initialValues.matchedIngredient &&
              search === initialValues.matchedIngredient.name && (
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setSelected(initialValues.matchedIngredient!);
                    setUnit(
                      (current) =>
                        current || initialValues.matchedIngredient!.defaultUnit,
                    );
                  }}
                >
                  Confirm
                </Button>
              )}
          </FlexRow>
        </TableCell>
        <TableCell>
          <Text as="span" className="block max-w-32 truncate" title={category}>
            {category || "—"}
          </Text>
        </TableCell>
        <TableCell>
          <Input
            className="w-20"
            aria-label="Quantity"
            placeholder="Required"
            title={
              quantity === ""
                ? "Enter the quantity before adding this item"
                : undefined
            }
            form={formId}
            type="number"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </TableCell>
        <TableCell>
          <Input
            className="w-20"
            aria-label="Unit"
            form={formId}
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            required
          />
        </TableCell>
        <TableCell>
          <Input
            className="w-36"
            aria-label="Expiry date"
            form={formId}
            type="date"
            value={expiresOn}
            onChange={(event) => setExpiresOn(event.target.value)}
          />
        </TableCell>
        <TableCell>
          <Form id={formId} spacing="none" onSubmit={submit}>
            <FlexRow gap="sm">
              <Button
                type="submit"
                size="small"
                disabled={
                  (!selected &&
                    (!canSubmitWithoutSelection || requireReview)) ||
                  !unit.trim() ||
                  !Number.isFinite(Number(quantity)) ||
                  Number(quantity) <= 0 ||
                  add.isPending
                }
              >
                {add.isPending
                  ? "Adding…"
                  : willCreateIngredient
                    ? "Create & add"
                    : "Add"}
              </Button>
              {onDiscard && (
                <Button
                  type="button"
                  variant="text"
                  size="small"
                  aria-label={`Discard ${title}`}
                  disabled={add.isPending}
                  onClick={onDiscard}
                >
                  ×
                </Button>
              )}
              {add.isError && (
                <Text
                  as="span"
                  variant="danger"
                  role="alert"
                  title="This ingredient could not be added. Check its details and try again."
                >
                  Could not add. Retry.
                </Text>
              )}
            </FlexRow>
          </Form>
        </TableCell>
      </TableRow>
    );
  }

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
      <FormField
        label="Name (optional)"
        hint="Use a product or brand name. Leave blank to show the catalog ingredient name."
        className="mt-4"
      >
        <Input
          value={name}
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
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
            : "This ingredient could not be added. Check its details and try again."}
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
