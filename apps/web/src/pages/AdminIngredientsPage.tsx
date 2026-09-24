import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  FlexRow,
  Form,
  FormField,
  Heading,
  Input,
  Page,
  Section,
  Select,
  Text,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ErrorState, LoadingState } from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";

type Draft = { name: string; defaultUnit: string; categoryId: string };

const emptyDraft: Draft = { name: "", defaultUnit: "", categoryId: "" };

export function AdminIngredientsPage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  const ingredients = useQuery({
    queryKey: ["admin-ingredients"],
    queryFn: () => api.adminIngredients(""),
    enabled: profile.data?.role === "admin",
  });
  const categories = useQuery({
    queryKey: ["admin-ingredient-categories"],
    queryFn: api.adminIngredientCategories,
    enabled: profile.data?.role === "admin",
  });
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
      await queryClient.invalidateQueries({ queryKey: ["admin-ingredient-categories"] });
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
  if (profile.isError) return <ErrorState message="Your access could not be verified." />;
  if (profile.data.role !== "admin") return <Navigate to="/recipes" replace />;
  if (ingredients.isPending) return <LoadingState label="Loading ingredients" />;
  if (ingredients.isError)
    return <ErrorState message="Ingredients could not be loaded." retry={() => void ingredients.refetch()} />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <Page>
      <Heading>Admin</Heading>
      <Text className="mt-2" variant="muted">
        Manage the shared ingredient catalog.
      </Text>
      <Section spacing="lg">
        <Card as={Form} className="max-w-2xl" onSubmit={(event) => {
          event.preventDefault();
          createCategory.mutate();
        }}>
          <Heading level={2} variant="card">Ingredient categories</Heading>
          <Text className="mt-2" variant="muted">
            Categories are shared across the ingredient catalog.
          </Text>
          <FlexRow className="mt-4" wrap>
            <Input required value={categoryName} maxLength={80} placeholder="e.g. Baking" onChange={(event) => setCategoryName(event.target.value)} />
            <Button type="submit" disabled={createCategory.isPending}>Add category</Button>
          </FlexRow>
          {createCategory.isError && <Alert className="mt-3">This category could not be added. Category names must be unique.</Alert>}
          {categories.isError ? (
            <Alert className="mt-3">Categories could not be loaded. Apply the latest database migration and restart the API.</Alert>
          ) : categories.isPending ? (
            <Text className="mt-4" variant="muted">Loading categories…</Text>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.data?.map((category) => <Text key={category.id} className="rounded-full bg-slate-100 px-3 py-1" variant="subtle">{category.name}</Text>)}
            </div>
          )}
        </Card>
        <Card as={Form} className="max-w-2xl" onSubmit={submit}>
          <Heading level={2} variant="card">
            {editing ? "Edit ingredient" : "Add ingredient"}
          </Heading>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField label="Name">
              <Input required value={draft.name} maxLength={120} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </FormField>
            <FormField label="Default unit">
              <Input required value={draft.defaultUnit} maxLength={30} onChange={(event) => setDraft({ ...draft, defaultUnit: event.target.value })} />
            </FormField>
            <FormField label="Category">
              <Select required value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
                <option value="">Select a category</option>
                {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
            </FormField>
          </div>
          <FlexRow className="mt-4">
            <Button type="submit" disabled={save.isPending}>
              {editing ? "Save ingredient" : "Add ingredient"}
            </Button>
            {editing && <Button type="button" variant="text" onClick={() => { setEditing(null); setDraft(emptyDraft); }}>Cancel</Button>}
          </FlexRow>
          {save.isError && <Alert className="mt-3">The ingredient could not be saved.</Alert>}
        </Card>
      </Section>
      <Section spacing="md" className="space-y-3">
        {ingredients.data.map((ingredient) => (
          <Card key={ingredient.id} variant="compact">
            <FlexRow align="between" wrap>
              <div>
                <Text variant="label">{ingredient.name}</Text>
                <Text variant="subtle">
                  {ingredient.defaultUnit}{ingredient.category ? ` · ${ingredient.category}` : ""}
                </Text>
              </div>
              <FlexRow>
                <Button type="button" variant="text" onClick={() => {
                  setEditing(ingredient.id);
                  setDraft({ name: ingredient.name, defaultUnit: ingredient.defaultUnit, categoryId: ingredient.categoryId });
                }}>Edit</Button>
                <Button type="button" variant="text" className="text-red-700" disabled={remove.isPending} onClick={() => remove.mutate(ingredient.id)}>Remove</Button>
              </FlexRow>
            </FlexRow>
          </Card>
        ))}
      </Section>
      {remove.isError && <Alert className="mt-4">This ingredient could not be removed. Ingredients already in use are retained.</Alert>}
    </Page>
  );
}
