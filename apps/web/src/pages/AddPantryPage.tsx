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
    style: "bg-herb-100 text-herb-700",
  },
  {
    key: "review",
    label: "Review required",
    style: "bg-amber-100 text-amber-900",
  },
  {
    key: "unmatched",
    label: "No catalog match",
    style: "bg-slate-100 text-slate-600",
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
      <PageHeader className="mt-4 items-center">
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
        className="mt-8 lg:grid-cols-[minmax(0,1fr)_19rem]"
      >
        <Section className="min-w-0">
          <FlexRow gap="sm" wrap>
            {groups.map((group) => (
              <Text
                as="span"
                key={group.key}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${group.style}`}
              >
                {group.label} ·{" "}
                {
                  ingredients.filter((item) => matchGroup(item) === group.key)
                    .length
                }
              </Text>
            ))}
          </FlexRow>
          <Text className="mt-3" variant="subtle">
            Matches below 80% need confirmation. Unmatched items stay available
            for a manual catalog search.
          </Text>
          <Card variant="flush" className="mt-4">
            <Section
              className="overflow-x-auto"
              role="region"
              aria-label="Ingredient review table"
              tabIndex={0}
            >
              <Table aria-label="Ingredients to add">
                <TableHead>
                  <TableRow className="bg-slate-50">
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
                      <TableRow className={group.style}>
                        <TableHeader
                          colSpan={8}
                          scope="rowgroup"
                          className="text-inherit"
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
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${group.style}`}
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
                    <TableRow className="bg-slate-50">
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
                        className="py-12 text-center text-slate-500"
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
                    <TableRow className="bg-slate-100">
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
                          className="bg-slate-50 text-slate-500"
                        >
                          <TableCell>Excluded</TableCell>
                          <TableCell>
                            <Text
                              as="span"
                              className="block max-w-48 truncate"
                              title={line.sourceText}
                            >
                              {line.productName || line.sourceText}
                            </Text>
                          </TableCell>
                          <TableCell colSpan={6}>
                            <Text
                              as="span"
                              className="block max-w-xl truncate"
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
