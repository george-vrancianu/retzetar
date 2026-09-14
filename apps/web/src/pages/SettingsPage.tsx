import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    <form className="card mt-8 max-w-2xl space-y-5" onSubmit={submit}>
      <label className="block font-semibold">
        Display name
        <input
          className="field mt-1"
          value={displayName}
          maxLength={80}
          required
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </label>
      <label className="block font-semibold">
        Email
        <input
          className="field mt-1 bg-slate-50"
          value={profile.email}
          disabled
        />
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Email changes are managed by authentication settings.
        </span>
      </label>
      <label className="block font-semibold">
        About you
        <textarea
          className="field mt-1 min-h-28"
          value={bio}
          maxLength={500}
          onChange={(event) => setBio(event.target.value)}
        />
      </label>
      <label className="block font-semibold">
        Diets
        <input
          className="field mt-1"
          value={diets}
          placeholder="Vegetarian, gluten-free"
          onChange={(event) => setDiets(event.target.value)}
        />
      </label>
      <label className="block font-semibold">
        Allergens
        <input
          className="field mt-1"
          value={allergens}
          placeholder="Peanuts, shellfish"
          onChange={(event) => setAllergens(event.target.value)}
        />
      </label>
      <label className="block font-semibold">
        Disliked ingredients
        <input
          className="field mt-1"
          value={disliked}
          placeholder="Cilantro, olives"
          onChange={(event) => setDisliked(event.target.value)}
        />
      </label>
      <button className="btn-primary" type="submit" disabled={update.isPending}>
        {update.isPending ? "Saving…" : "Save profile"}
      </button>
      {update.isSuccess && (
        <p className="text-sm font-semibold text-herb-700" role="status">
          Profile saved.
        </p>
      )}
      {update.isError && (
        <p className="text-sm text-red-700" role="alert">
          Profile could not be saved.
        </p>
      )}
    </form>
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
    <section>
      <h1 className="text-3xl font-black sm:text-4xl">
        Profile and food preferences
      </h1>
      <p className="mt-2 text-slate-600">
        Personalize recipe suggestions and flag ingredients you avoid.
      </p>
      <ProfileForm profile={profile.data} />
    </section>
  );
}
