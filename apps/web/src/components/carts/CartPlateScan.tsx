import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  FormField,
  Heading,
  Input,
  PhotoPicker,
  Text,
} from "@retzetar/ui";
import { useState } from "react";
import { api } from "../../lib/api.ts";
import { prepareImage } from "../../lib/image-data.ts";

export function CartPlateScan({ cartId }: { cartId: string }) {
  const queryClient = useQueryClient();
  const [photo, setPhoto] = useState<File | null>(null);
  const [portions, setPortions] = useState(2);
  const scan = useMutation({
    mutationFn: async (file: File) =>
      api.scanPlate({ plateImage: await prepareImage(file) }),
  });
  const ingredients = useMutation({
    mutationFn: (title: string) => api.scanPlateIngredients(title),
  });
  const add = useMutation({
    mutationFn: (items: any[]) =>
      api.addCartItems(cartId, {
        items: items
          .filter(
            (item) => item.matchedIngredientId && item.quantity && item.unit,
          )
          .map((item) => ({
            ingredientId: item.matchedIngredientId,
            quantity: item.quantity * portions,
            unit: item.unit,
          })),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] }),
  });

  return (
    <Card sx={{ mt: 3 }}>
      <Heading level={2} variant="card">
        Scan plate
      </Heading>
      <Text sx={{ mt: 1 }} variant="subtle">
        Find a recipe, then add its matched ingredients to this cart.
      </Text>
      <PhotoPicker
        sx={{ mt: 2 }}
        label="Plate photo"
        files={photo ? [photo] : []}
        onFilesChange={(files) => setPhoto(files[0] ?? null)}
        uploading={scan.isPending}
        statusLabel="Reading photo…"
      />
      <Button
        sx={{ mt: 2 }}
        block
        type="button"
        disabled={!photo || scan.isPending}
        onClick={() => photo && scan.mutate(photo)}
      >
        {scan.isPending ? "Finding recipes…" : "Find recipes"}
      </Button>
      {scan.data?.matches.map((match) => (
        <Button
          key={match.title}
          sx={{ mt: 1 }}
          block
          type="button"
          variant="secondary"
          onClick={() => ingredients.mutate(match.title)}
        >
          {match.title + " - " + Math.round(match.confidence * 100) + "% match"}
        </Button>
      ))}
      {ingredients.data && (
        <>
          <FormField sx={{ mt: 2 }} label="Portions">
            <Input
              type="number"
              min="1"
              value={portions}
              onChange={(event) =>
                setPortions(Math.max(1, Number(event.target.value) || 1))
              }
            />
          </FormField>
          <Text variant="subtle">
            Shown per portion; added quantities are scaled to {portions}{" "}
            portions.
          </Text>
          {ingredients.data.items.map((item) => (
            <Card key={item.productName} variant="compact">
              <Text variant="label">
                {item.matchedIngredientName ?? item.productName}
              </Text>
              <Text variant="subtle">
                {item.quantity ?? "Quantity needed"} {item.unit ?? ""} per
                portion
              </Text>
              <Button
                sx={{ mt: 1 }}
                type="button"
                variant="secondary"
                disabled={
                  !item.matchedIngredientId ||
                  !item.quantity ||
                  !item.unit ||
                  add.isPending
                }
                onClick={() => add.mutate([item])}
              >
                Add ingredient
              </Button>
            </Card>
          ))}
          <Button
            sx={{ mt: 2 }}
            block
            type="button"
            disabled={add.isPending}
            onClick={() => add.mutate(ingredients.data.items)}
          >
            Add matched ingredients to cart
          </Button>
        </>
      )}
      {(scan.isError || ingredients.isError || add.isError) && (
        <Alert sx={{ mt: 2 }}>That action could not be completed.</Alert>
      )}
    </Card>
  );
}
