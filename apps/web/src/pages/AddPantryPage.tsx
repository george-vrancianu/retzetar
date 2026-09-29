import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ActionLink,
  Button,
  Card,
  FlexCol,
  FlexRow,
  Grid,
  Heading,
  Page,
  PageHeader,
  Section,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@retzetar/ui";
import { AddPantryIngredientCard } from "../components/pantry/AddPantryIngredientCard.tsx";
import { PantryScanPanel } from "../components/pantry/PantryScanPanel.tsx";
import {
  HIGH_CONFIDENCE_MATCH,
  useScannedIngredientsStore,
  type ScannedIngredientDraft,
} from "../stores/scanned-ingredients-store.ts";

function matchGroup(item: ScannedIngredientDraft) {
  if (
    !item.matchedIngredientId ||
    !item.matchedIngredientName ||
    item.matchConfidence <= 0
  )
    return "unmatched";
  return item.matchConfidence >= HIGH_CONFIDENCE_MATCH ? "matched" : "review";
}

const groups = [
  {
    key: "matched",
    label: "High confidence",
    style: { bgcolor: "primary.light", color: "primary.main" },
  },
  {
    key: "review",
    label: "Review required",
    style: { bgcolor: "#fef3c7", color: "#78350f" },
  },
  {
    key: "unmatched",
    label: "No catalog match",
    style: { bgcolor: "grey.100", color: "text.secondary" },
  },
] as const;

export function AddPantryPage() {
  const ingredients = useScannedIngredientsStore((state) => state.ingredients);
  const removeIngredient = useScannedIngredientsStore(
    (state) => state.removeIngredient,
  );
  const receiptScans = useScannedIngredientsStore(
    (state) => state.receiptScans,
  );
  const removeReceiptScan = useScannedIngredientsStore(
    (state) => state.removeReceiptScan,
  );
  const [manualRows, setManualRows] = useState<string[]>([]);
  const removeManual = (id: string) =>
    setManualRows((rows) => rows.filter((row) => row !== id));
  const excludedReceipts = receiptScans.filter((report) =>
    report.lines.some((line) => !line.includeInPantry),
  );

  return (
    <Page>
      <ActionLink as={Link} to="/pantry">
        ← Back to pantry
      </ActionLink>
      <PageHeader sx={{ mt: 2, alignItems: "center" }}>
        <Heading>Add ingredients</Heading>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setManualRows((rows) => [...rows, crypto.randomUUID()])
          }
        >
          + Add manually
        </Button>
      </PageHeader>
      <Grid
        variant="sidebar"
        sx={{ mt: 4, gridTemplateColumns: { lg: "minmax(0,1fr) 19rem" } }}
      >
        <Section sx={{ minWidth: 0 }}>
          <FlexRow gap="sm" wrap>
            {groups.map((group) => (
              <Text
                as="span"
                key={group.key}
                sx={{
                  borderRadius: 99,
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  ...group.style,
                }}
              >
                {group.label} ·{" "}
                {
                  ingredients.filter((item) => matchGroup(item) === group.key)
                    .length
                }
              </Text>
            ))}
          </FlexRow>
          <Text sx={{ mt: 1.5 }} variant="subtle">
            Matches below 80% need confirmation. Unmatched items stay available
            for a manual catalog search.
          </Text>
          <Card variant="flush" sx={{ mt: 2 }}>
            <Section
              sx={{ overflowX: "auto" }}
              role="region"
              aria-label="Ingredient review table"
              tabIndex={0}
            >
              <Table aria-label="Ingredients to add">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {[
                      "Match",
                      "Product",
                      "Catalog ingredient",
                      "Category",
                      "Quantity",
                      "Unit",
                      "Expiry date",
                      "Actions",
                    ].map((column) => (
                      <TableHeader scope="col" key={column}>
                        {column}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                {groups.map((group) => {
                  const items = ingredients
                    .filter((item) => matchGroup(item) === group.key)
                    .sort((a, b) => b.matchConfidence - a.matchConfidence);
                  if (!items.length) return null;
                  return (
                    <TableBody key={group.key} aria-label={group.label}>
                      <TableRow sx={group.style}>
                        <TableHeader
                          colSpan={8}
                          scope="rowgroup"
                          sx={{ color: "inherit" }}
                        >
                          {group.label} ({items.length})
                        </TableHeader>
                      </TableRow>
                      {items.map((item) => (
                        <AddPantryIngredientCard
                          key={item.id}
                          layout="row"
                          title={item.productName}
                          tone={group.key}
                          category={item.matchedCategory ?? item.productType}
                          requireReview={group.key === "review"}
                          status={
                            <Text
                              as="span"
                              sx={{
                                borderRadius: 99,
                                px: 1,
                                py: 0.5,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                ...group.style,
                              }}
                              title={
                                item.source === "receipt"
                                  ? "Receipt scan"
                                  : "Product scan"
                              }
                            >
                              {group.key === "unmatched"
                                ? "Unmatched"
                                : `${Math.round(item.matchConfidence * 100)}% match`}
                            </Text>
                          }
                          initialValues={{
                            name: item.productName,
                            ingredientQuery: item.fallbackIngredientName,
                            matchedIngredient:
                              group.key !== "unmatched" &&
                              item.matchedIngredientId &&
                              item.matchedIngredientName
                                ? {
                                    id: item.matchedIngredientId,
                                    name: item.matchedIngredientName,
                                    defaultUnit:
                                      item.matchedIngredientDefaultUnit ||
                                      item.unit,
                                  }
                                : undefined,
                            quantity: item.quantity,
                            unit: item.unit,
                            expiresOn: item.expiresOn,
                          }}
                          onAdded={() => removeIngredient(item.id)}
                          onDiscard={() => removeIngredient(item.id)}
                        />
                      ))}
                    </TableBody>
                  );
                })}
                {manualRows.length > 0 && (
                  <TableBody aria-label="Manual ingredients">
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableHeader colSpan={8} scope="rowgroup">
                        Manual ingredients ({manualRows.length})
                      </TableHeader>
                    </TableRow>
                    {manualRows.map((id) => (
                      <AddPantryIngredientCard
                        key={id}
                        layout="row"
                        title="Manual ingredient"
                        status="Manual"
                        onAdded={() => removeManual(id)}
                        onDiscard={() => removeManual(id)}
                      />
                    ))}
                  </TableBody>
                )}
                {ingredients.length === 0 && manualRows.length === 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ py: 6, textAlign: "center", color: "grey.500" }}
                      >
                        Scan a product or receipt, or choose “Add manually” to
                        get started.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {excludedReceipts.map((report) => (
                  <TableBody
                    key={report.id}
                    aria-label="Excluded receipt lines"
                  >
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableHeader colSpan={8} scope="rowgroup">
                        <FlexRow align="between">
                          <Text as="span">
                            Excluded receipt lines ·{" "}
                            {report.merchantName || "Receipt"}
                            {report.purchaseDate
                              ? ` · ${report.purchaseDate}`
                              : ""}
                          </Text>
                          <Button
                            size="small"
                            type="button"
                            variant="text"
                            onClick={() => removeReceiptScan(report.id)}
                          >
                            Dismiss
                          </Button>
                        </FlexRow>
                      </TableHeader>
                    </TableRow>
                    {report.lines
                      .filter((line) => !line.includeInPantry)
                      .map((line) => (
                        <TableRow
                          key={line.lineNumber}
                          sx={{ bgcolor: "grey.50", color: "grey.500" }}
                        >
                          <TableCell>Excluded</TableCell>
                          <TableCell>
                            <Text
                              as="span"
                              sx={{
                                display: "block",
                                maxWidth: 192,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={line.sourceText}
                            >
                              {line.productName || line.sourceText}
                            </Text>
                          </TableCell>
                          <TableCell colSpan={6}>
                            <Text
                              as="span"
                              sx={{
                                display: "block",
                                maxWidth: 576,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={line.matchExplanation}
                            >
                              {line.exclusionReason || line.matchExplanation}
                            </Text>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                ))}
              </Table>
            </Section>
          </Card>
        </Section>
        <FlexCol>
          <PantryScanPanel />
        </FlexCol>
      </Grid>
    </Page>
  );
}
