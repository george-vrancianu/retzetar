import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Form,
  FormField,
  Heading,
  Input,
  MultiSelectCombobox,
  Option,
  Page,
  Select,
  Status,
  Text,
  Textarea,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import { ErrorState, LoadingState } from "../components/QueryState.tsx";
import { api, type UserProfile } from "../lib/api.ts";
import { localeOptions } from "../lib/locale-options.ts";

function ProfileForm({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient();
  const dietTypes = useQuery({
    queryKey: ["diet-types"],
    queryFn: api.dietTypes,
  });
  const ingredients = useQuery({
    queryKey: ["ingredients", ""],
    queryFn: () => api.ingredients(""),
  });
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [locale, setLocale] = useState(profile.locale);
  const [preferredDietTypeIds, setPreferredDietTypeIds] = useState(
    profile.dietary.preferredDietTypes.map((dietType) => dietType.id),
  );
  const [allergicIngredientIds, setAllergicIngredientIds] = useState(
    profile.dietary.allergicIngredients.map((ingredient) => ingredient.id),
  );
  const [dislikedIngredientIds, setDislikedIngredientIds] = useState(
    profile.dietary.dislikedIngredients.map((ingredient) => ingredient.id),
  );
  const [dietTypeSearch, setDietTypeSearch] = useState("");
  const [allergicIngredientSearch, setAllergicIngredientSearch] = useState("");
  const [dislikedIngredientSearch, setDislikedIngredientSearch] = useState("");

  const dietTypeOptions = dietTypes.data ?? profile.dietary.preferredDietTypes;
  const ingredientOptions =
    ingredients.data ??
    [...profile.dietary.allergicIngredients, ...profile.dietary.dislikedIngredients];

  const update = useMutation({
    mutationFn: () =>
      api.updateProfile({
        displayName,
        bio: bio || null,
        locale,
        dietary: {
          preferredDietTypeIds,
          allergicIngredientIds,
          dislikedIngredientIds,
        },
      }),
    onSuccess: (data) => queryClient.setQueryData(["profile"], data),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate();
  };

  return (
    <Card as={Form} sx={{ mt: 4, maxWidth: 672, gap: 2.5 }} onSubmit={submit}>
      <FormField label="Display name">
        <Input
          value={displayName}
          maxLength={80}
          required
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </FormField>
      <FormField
        label="Email"
        hint="Email changes are managed by authentication settings."
      >
        <Input sx={{ bgcolor: "grey.50" }} value={profile.email} disabled />
      </FormField>
      <FormField label="About you">
        <Textarea
          value={bio}
          maxLength={500}
          onChange={(event) => setBio(event.target.value)}
        />
      </FormField>
      <FormField
        label="Locale"
        hint="Helps recognize local product names, package and receipt abbreviations, and dates."
      >
        <Select
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
        >
          {!localeOptions.some((option) => option.value === locale) && (
            <Option value={locale}>{locale}</Option>
          )}
          {localeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Preferred diet types"
        hint="Search for a diet type, then add it to your preferences."
      >
        <MultiSelectCombobox
          label="Search diet types"
          value={dietTypeSearch}
          onChange={setDietTypeSearch}
          selectedOptions={dietTypeOptions
            .filter((dietType) => preferredDietTypeIds.includes(dietType.id))
            .map((dietType) => ({ id: dietType.id, label: dietType.name }))}
          options={dietTypeOptions
            .filter((dietType) => !preferredDietTypeIds.includes(dietType.id))
            .filter((dietType) =>
              dietType.name
                .toLocaleLowerCase()
                .includes(dietTypeSearch.toLocaleLowerCase()),
            )
            .map((dietType) => ({ id: dietType.id, label: dietType.name }))}
          disabled={dietTypes.isPending || dietTypes.isError}
          loading={dietTypes.isFetching}
          resultsLabel="Diet type results"
          onAdd={(dietType) =>
            setPreferredDietTypeIds((ids) => [...ids, dietType.id])
          }
          onRemove={(dietType) =>
            setPreferredDietTypeIds((ids) =>
              ids.filter((id) => id !== dietType.id),
            )
          }
        />
      </FormField>
      <FormField
        label="Allergic ingredients"
        hint="Search for an ingredient, then add it to your allergies."
      >
        <MultiSelectCombobox
          label="Search allergic ingredients"
          value={allergicIngredientSearch}
          onChange={setAllergicIngredientSearch}
          selectedOptions={ingredientOptions
            .filter((ingredient) => allergicIngredientIds.includes(ingredient.id))
            .map((ingredient) => ({ id: ingredient.id, label: ingredient.name }))}
          options={ingredientOptions
            .filter((ingredient) => !allergicIngredientIds.includes(ingredient.id))
            .filter((ingredient) =>
              ingredient.name
                .toLocaleLowerCase()
                .includes(allergicIngredientSearch.toLocaleLowerCase()),
            )
            .map((ingredient) => ({ id: ingredient.id, label: ingredient.name }))}
          disabled={ingredients.isPending || ingredients.isError}
          loading={ingredients.isFetching}
          resultsLabel="Ingredient results"
          onAdd={(ingredient) =>
            setAllergicIngredientIds((ids) => [...ids, ingredient.id])
          }
          onRemove={(ingredient) =>
            setAllergicIngredientIds((ids) =>
              ids.filter((id) => id !== ingredient.id),
            )
          }
        />
      </FormField>
      <FormField
        label="Disliked ingredients"
        hint="Search for an ingredient, then add it to your dislikes."
      >
        <MultiSelectCombobox
          label="Search disliked ingredients"
          value={dislikedIngredientSearch}
          onChange={setDislikedIngredientSearch}
          selectedOptions={ingredientOptions
            .filter((ingredient) => dislikedIngredientIds.includes(ingredient.id))
            .map((ingredient) => ({ id: ingredient.id, label: ingredient.name }))}
          options={ingredientOptions
            .filter((ingredient) => !dislikedIngredientIds.includes(ingredient.id))
            .filter((ingredient) =>
              ingredient.name
                .toLocaleLowerCase()
                .includes(dislikedIngredientSearch.toLocaleLowerCase()),
            )
            .map((ingredient) => ({ id: ingredient.id, label: ingredient.name }))}
          disabled={ingredients.isPending || ingredients.isError}
          loading={ingredients.isFetching}
          resultsLabel="Ingredient results"
          onAdd={(ingredient) =>
            setDislikedIngredientIds((ids) => [...ids, ingredient.id])
          }
          onRemove={(ingredient) =>
            setDislikedIngredientIds((ids) =>
              ids.filter((id) => id !== ingredient.id),
            )
          }
        />
      </FormField>
      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? "Saving…" : "Save profile"}
      </Button>
      {update.isSuccess && <Status>Profile saved.</Status>}
      {update.isError && <Alert>Profile could not be saved.</Alert>}
    </Card>
  );
}

export function SettingsPage() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  if (profile.isPending) return <LoadingState label="Loading profile" />;
  if (profile.isError)
    return (
      <ErrorState
        message="Your profile could not be loaded."
        retry={() => void profile.refetch()}
      />
    );

  return (
    <Page>
      <Heading>Profile and food preferences</Heading>
      <Text sx={{ mt: 1 }} variant="muted">
        Personalize recipe suggestions and flag ingredients you avoid.
      </Text>
      <ProfileForm profile={profile.data} />
    </Page>
  );
}
