import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  FlexRow,
  Form,
  FormField,
  FlexCol,
  Heading,
  Input,
  Grid,
  Option,
  Page,
  Section,
  Select,
  Text,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ErrorState, LoadingState } from "../../../components/QueryState.tsx";
import { api } from "../../../lib/api.ts";
import { useAdminIngredientData } from "../hooks/useAdminIngredientData.ts";

type Draft = { name: string; defaultUnit: string; categoryId: string };

const emptyDraft: Draft = { name: "", defaultUnit: "", categoryId: "" };

export function AdminIngredientsContent() {
  const queryClient = useQueryClient();
  const { categories, ingredients, profile } = useAdminIngredientData();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [categoryName, setCategoryName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () =>
      editing
        ? api.updateAdminIngredient(editing, draft)
        : api.createAdminIngredient(draft),
    onSuccess: async () => {
      setDraft(emptyDraft);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-ingredients"] });
      await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
  const createCategory = useMutation({
    mutationFn: () => api.createAdminIngredientCategory(categoryName),
    onSuccess: async () => {
      setCategoryName("");
      await queryClient.invalidateQueries({
        queryKey: ["admin-ingredient-categories"],
      });
    },
  });
  const remove = useMutation({
    mutationFn: api.removeAdminIngredient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-ingredients"] });
      await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });

  if (profile.isPending) return <LoadingState label="Checking access" />;
  if (profile.isError)
    return <ErrorState message="Your access could not be verified." />;
  if (profile.data.role !== "admin") return <Navigate to="/recipes" replace />;
  if (ingredients.isPending)
    return <LoadingState label="Loading ingredients" />;
  if (ingredients.isError)
    return (
      <ErrorState
        message="Ingredients could not be loaded."
        retry={() => void ingredients.refetch()}
      />
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <Page>
      <Heading>Admin</Heading>
      <Text sx={{ mt: 1 }} variant="muted">
        Manage the shared ingredient catalog.
      </Text>
      <Section spacing="lg">
        <Card
          as={Form}
          sx={{ maxWidth: 672 }}
          onSubmit={(event) => {
            event.preventDefault();
            createCategory.mutate();
          }}
        >
          <Heading level={2} variant="card">
            Ingredient categories
          </Heading>
          <Text sx={{ mt: 1 }} variant="muted">
            Categories are shared across the ingredient catalog.
          </Text>
          <FlexRow sx={{ mt: 2 }} wrap>
            <Input
              required
              value={categoryName}
              maxLength={80}
              placeholder="e.g. Baking"
              onChange={(event) => setCategoryName(event.target.value)}
            />
            <Button type="submit" disabled={createCategory.isPending}>
              Add category
            </Button>
          </FlexRow>
          {createCategory.isError && (
            <Alert sx={{ mt: 1.5 }}>
              This category could not be added. Category names must be unique.
            </Alert>
          )}
          {categories.isError ? (
            <Alert sx={{ mt: 1.5 }}>
              Categories could not be loaded. Apply the latest database
              migration and restart the API.
            </Alert>
          ) : categories.isPending ? (
            <Text sx={{ mt: 2 }} variant="muted">
              Loading categories…
            </Text>
          ) : (
            <FlexRow sx={{ mt: 2 }} gap="sm" wrap>
              {categories.data?.map((category) => (
                <Text
                  key={category.id}
                  sx={{
                    borderRadius: 99,
                    bgcolor: "grey.100",
                    px: 1.5,
                    py: 0.5,
                  }}
                  variant="subtle"
                >
                  {category.name}
                </Text>
              ))}
            </FlexRow>
          )}
        </Card>
        <Card as={Form} sx={{ maxWidth: 672 }} onSubmit={submit}>
          <Heading level={2} variant="card">
            {editing ? "Edit ingredient" : "Add ingredient"}
          </Heading>
          <Grid
            variant="fields"
            sx={{
              mt: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
              gap: 2,
            }}
          >
            <FormField label="Name">
              <Input
                required
                value={draft.name}
                maxLength={120}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </FormField>
            <FormField label="Default unit">
              <Input
                required
                value={draft.defaultUnit}
                maxLength={30}
                onChange={(event) =>
                  setDraft({ ...draft, defaultUnit: event.target.value })
                }
              />
            </FormField>
            <FormField label="Category">
              <Select
                required
                value={draft.categoryId}
                onChange={(event) =>
                  setDraft({ ...draft, categoryId: event.target.value })
                }
              >
                <Option value="">Select a category</Option>
                {(categories.data ?? []).map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </FormField>
          </Grid>
          <FlexRow sx={{ mt: 2 }}>
            <Button type="submit" disabled={save.isPending}>
              {editing ? "Save ingredient" : "Add ingredient"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  setEditing(null);
                  setDraft(emptyDraft);
                }}
              >
                Cancel
              </Button>
            )}
          </FlexRow>
          {save.isError && (
            <Alert sx={{ mt: 1.5 }}>The ingredient could not be saved.</Alert>
          )}
        </Card>
      </Section>
      <Section spacing="md" sx={{ display: "grid", gap: 1.5 }}>
        {ingredients.data.map((ingredient) => (
          <Card key={ingredient.id} variant="compact">
            <FlexRow align="between" wrap>
              <FlexCol gap="none">
                <Text variant="label">{ingredient.name}</Text>
                <Text variant="subtle">
                  {ingredient.defaultUnit}
                  {ingredient.category ? ` · ${ingredient.category}` : ""}
                </Text>
              </FlexCol>
              <FlexRow>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => {
                    setEditing(ingredient.id);
                    setDraft({
                      name: ingredient.name,
                      defaultUnit: ingredient.defaultUnit,
                      categoryId: ingredient.categoryId,
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(ingredient.id)}
                >
                  Remove
                </Button>
              </FlexRow>
            </FlexRow>
          </Card>
        ))}
      </Section>
      {remove.isError && (
        <Alert sx={{ mt: 2 }}>
          This ingredient could not be removed. Ingredients already in use are
          retained.
        </Alert>
      )}
    </Page>
  );
}
