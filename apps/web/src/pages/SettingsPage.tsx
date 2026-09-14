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
  Status,
  Text,
  Textarea,
} from "@retzetar/ui";
import { useState, type FormEvent } from "react";
import { ErrorState, LoadingState } from "../components/QueryState.tsx";
import { api, type UserProfile } from "../lib/api.ts";

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function ProfileForm({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [diets, setDiets] = useState(profile.dietary.diets.join(", "));
  const [allergens, setAllergens] = useState(
    profile.dietary.allergens.join(", "),
  );
  const [disliked, setDisliked] = useState(
    profile.dietary.dislikedIngredients.join(", "),
  );
  const update = useMutation({
    mutationFn: () =>
      api.updateProfile({
        displayName,
        bio: bio || null,
        dietary: {
          diets: splitList(diets),
          allergens: splitList(allergens),
          dislikedIngredients: splitList(disliked),
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
      <FormField label="Diets">
        <Input
          value={diets}
          placeholder="Vegetarian, gluten-free"
          onChange={(event) => setDiets(event.target.value)}
        />
      </FormField>
      <FormField label="Allergens">
        <Input
          value={allergens}
          placeholder="Peanuts, shellfish"
          onChange={(event) => setAllergens(event.target.value)}
        />
      </FormField>
      <FormField label="Disliked ingredients">
        <Input
          value={disliked}
          placeholder="Cilantro, olives"
          onChange={(event) => setDisliked(event.target.value)}
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
      <Text className="mt-2" variant="muted">
        Personalize recipe suggestions and flag ingredients you avoid.
      </Text>
      <ProfileForm profile={profile.data} />
    </Page>
  );
}
