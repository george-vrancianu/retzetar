import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  FormField,
  Heading,
  Input,
  Text,
} from "@retzetar/ui";
import { useState } from "react";
import { api } from "../../lib/api.ts";
import { prepareImage } from "../../lib/image-data.ts";
import { useScannedIngredientsStore } from "../../stores/scanned-ingredients-store.ts";

function PhotoInput({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <FormField label={label} hint={file ? `Selected: ${file.name}` : hint}>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </FormField>
  );
}

export function PantryScanPanel() {
  const addIngredients = useScannedIngredientsStore(
    (state) => state.addIngredients,
  );
  const addReceiptScan = useScannedIngredientsStore(
    (state) => state.addReceiptScan,
  );
  const [productOpen, setProductOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [expiryPhoto, setExpiryPhoto] = useState<File | null>(null);
  const [expiresOn, setExpiresOn] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null);

  const productScan = useMutation({
    mutationFn: async ({
      product,
      expiry,
    }: {
      product: File;
      expiry: File | null;
    }) =>
      api.scanProduct({
        productImage: await prepareImage(product),
        expiryImage: expiry ? await prepareImage(expiry) : null,
      }),
    onSuccess: (result) => {
      addIngredients([
        {
          source: "product",
          productName: result.productName,
          productType: result.productType,
          matchedIngredientId: result.matchedIngredientId,
          matchedIngredientName: result.matchedIngredientName,
          matchedIngredientDefaultUnit: result.matchedIngredientDefaultUnit,
          matchedCategory: result.matchedCategory,
          matchConfidence: result.matchConfidence,
          fallbackIngredientName: result.fallbackIngredientName,
          quantity: 1,
          unit: "",
          expiresOn: expiresOn || result.expiryDate || "",
          confidence: result.confidence,
        },
      ]);
      setProductPhoto(null);
      setExpiryPhoto(null);
      setExpiresOn("");
    },
  });

  const receiptScan = useMutation({
    mutationFn: async (receipt: File) =>
      api.scanReceipt({ receiptImage: await prepareImage(receipt) }),
    onSuccess: (result) => {
      addReceiptScan({
        merchantName: result.merchantName,
        purchaseDate: result.purchaseDate,
        lines: result.lines.map((line) => ({
          lineNumber: line.lineNumber,
          sourceText: line.sourceText,
          lineType: line.lineType,
          includeInPantry: line.includeInPantry,
          exclusionReason: line.exclusionReason,
          productName: line.productName,
          matchedIngredientId: line.matchedIngredientId,
          matchedIngredientName: line.matchedIngredientName,
          matchedCategory: line.matchedCategory,
          matchConfidence: line.matchConfidence,
          fallbackIngredientName: line.fallbackIngredientName,
          matchExplanation: line.matchExplanation,
          quantityType: line.quantityType,
          purchasedCount: line.purchasedCount,
          quantityPerItem: line.quantityPerItem,
          quantityUnit: line.quantityUnit,
          quantity: line.quantity,
          unit: line.unit,
        })),
      });
      addIngredients(
        result.items.map((item) => ({
          source: "receipt" as const,
          productName: item.productName,
          productType: item.productType,
          matchedIngredientId: item.matchedIngredientId,
          matchedIngredientName: item.matchedIngredientName,
          matchedIngredientDefaultUnit: item.matchedIngredientDefaultUnit,
          matchedCategory: item.matchedCategory,
          matchConfidence: item.matchConfidence,
          fallbackIngredientName: item.fallbackIngredientName,
          quantity: item.quantity,
          unit: item.unit ?? "",
          expiresOn: "",
          confidence: item.confidence,
        })),
      );
      setReceiptPhoto(null);
    },
  });

  return (
    <Card>
      <Heading level={2} variant="card">
        Scan groceries
      </Heading>
      <Text className="mt-2" variant="subtle">
        Scan one packaged product or extract all food items from a receipt.
      </Text>
      <Button
        className="mt-4"
        block
        type="button"
        variant="secondary"
        aria-expanded={productOpen}
        onClick={() => setProductOpen((open) => !open)}
      >
        {productOpen ? "Hide product scanner" : "Scan product"}
      </Button>
      {productOpen && (
        <Card variant="compact" className="mt-4 space-y-4">
          <Heading level={3} variant="card">
            Product scanner
          </Heading>
          <Text variant="subtle">
            Photograph the product and its expiry stamp. You can enter the date
            manually instead.
          </Text>
          <PhotoInput
            label="1. Product photo"
            hint="Show the front label clearly."
            file={productPhoto}
            onChange={setProductPhoto}
          />
          <PhotoInput
            label="2. Expiry date photo"
            hint="Focus on the use-by or best-before stamp."
            file={expiryPhoto}
            onChange={setExpiryPhoto}
          />
          <FormField label="Or enter expiry date manually">
            <Input
              type="date"
              value={expiresOn}
              onChange={(event) => setExpiresOn(event.target.value)}
            />
          </FormField>
          <Button
            block
            type="button"
            disabled={
              !productPhoto ||
              (!expiryPhoto && !expiresOn) ||
              productScan.isPending
            }
            onClick={() => {
              if (!productPhoto) return;
              productScan.mutate({
                product: productPhoto,
                expiry: expiryPhoto,
              });
            }}
          >
            {productScan.isPending ? "Reading photos…" : "Read product"}
          </Button>
          {productScan.isError && (
            <Alert>
              The product photos could not be read. Please try again.
            </Alert>
          )}
          {productScan.isSuccess && (
            <Alert variant="info">Product added to the review table.</Alert>
          )}
        </Card>
      )}

      <Button
        className="mt-3"
        block
        type="button"
        variant="secondary"
        aria-expanded={receiptOpen}
        onClick={() => setReceiptOpen((open) => !open)}
      >
        {receiptOpen ? "Hide receipt scanner" : "Scan receipt"}
      </Button>
      {receiptOpen && (
        <Card variant="compact" className="mt-4 space-y-4">
          <Heading level={3} variant="card">
            Receipt scanner
          </Heading>
          <Text variant="subtle">
            Use one clear photo containing the complete receipt. Only food and
            beverage purchases will be queued.
          </Text>
          <PhotoInput
            label="Receipt photo"
            hint="Keep the receipt flat, well lit, and readable."
            file={receiptPhoto}
            onChange={setReceiptPhoto}
          />
          <Button
            block
            type="button"
            disabled={!receiptPhoto || receiptScan.isPending}
            onClick={() => {
              if (receiptPhoto) receiptScan.mutate(receiptPhoto);
            }}
          >
            {receiptScan.isPending ? "Reading receipt…" : "Read receipt"}
          </Button>
          {receiptScan.isError && (
            <Alert>
              {receiptScan.error.message ||
                "The receipt could not be read. Please try a clearer photo."}
            </Alert>
          )}
          {receiptScan.data && (
            <Alert variant="info">
              {receiptScan.data.items.length === 0
                ? "No grocery items were found on this receipt."
                : `${receiptScan.data.items.length} grocery item${
                    receiptScan.data.items.length === 1 ? "" : "s"
                  } added to the review table.`}
            </Alert>
          )}
        </Card>
      )}
    </Card>
  );
}
