import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Form,
  FormField,
  Heading,
  Input,
  Page,
  Option,
  Select,
  Status,
  Text,
  Textarea,
} from "@retzetar/ui";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ErrorState, LoadingState } from "../components/QueryState.tsx";
import { api, type UserProfile } from "../lib/api.ts";

const selectedValues = (event: ChangeEvent<HTMLSelectElement>) =>
  Array.from(event.currentTarget.selectedOptions, (option) => option.value);

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
  const [preferredDietTypeIds, setPreferredDietTypeIds] = useState(
    profile.dietary.preferredDietTypes.map((dietType) => dietType.id),
  );
  const [allergicIngredientIds, setAllergicIngredientIds] = useState(
    profile.dietary.allergicIngredients.map((ingredient) => ingredient.id),
  );
  const [dislikedIngredientIds, setDislikedIngredientIds] = useState(
    profile.dietary.dislikedIngredients.map((ingredient) => ingredient.id),
  );
  const update = useMutation({
    mutationFn: () =>
      api.updateProfile({
        displayName,
        bio: bio || null,
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
    <Card as={Form} className="mt-8 max-w-2xl space-y-5" onSubmit={submit}>
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
        <Input className="bg-slate-50" value={profile.email} disabled />
      </FormField>
      <FormField label="About you">
        <Textarea
          value={bio}
          maxLength={500}
          onChange={(event) => setBio(event.target.value)}
        />
      </FormField>
      <FormField
        label="Preferred diet types"
        hint="Use Ctrl or Cmd to select more than one."
      >
        <Select
          multiple
          className="min-h-32"
          value={preferredDietTypeIds}
          disabled={dietTypes.isPending || dietTypes.isError}
          onChange={(event) => setPreferredDietTypeIds(selectedValues(event))}
        >
          {dietTypes.data?.map((dietType) => (
            <Option key={dietType.id} value={dietType.id}>
              {dietType.name}
            </Option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Allergic ingredients"
        hint="Use Ctrl or Cmd to select more than one."
      >
        <Select
          multiple
          className="min-h-32"
          value={allergicIngredientIds}
          disabled={ingredients.isPending || ingredients.isError}
          onChange={(event) => setAllergicIngredientIds(selectedValues(event))}
        >
          {ingredients.data?.map((ingredient) => (
            <Option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </Option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Disliked ingredients"
        hint="Use Ctrl or Cmd to select more than one."
      >
        <Select
          multiple
          className="min-h-32"
          value={dislikedIngredientIds}
          disabled={ingredients.isPending || ingredients.isError}
          onChange={(event) => setDislikedIngredientIds(selectedValues(event))}
        >
          {ingredients.data?.map((ingredient) => (
            <Option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </Option>
          ))}
        </Select>
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
      <Text className="mt-2" variant="muted">
        Personalize recipe suggestions and flag ingredients you avoid.
      </Text>
      <ProfileForm profile={profile.data} />
    </Page>
  );
}
