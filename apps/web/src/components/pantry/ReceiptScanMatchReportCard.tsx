import {
  Button,
  Card,
  FlexCol,
  FlexRow,
  Heading,
  List,
  Text,
} from "@retzetar/ui";
import {
  HIGH_CONFIDENCE_MATCH,
  type ReceiptScanMatchReport,
} from "../../stores/scanned-ingredients-store.ts";

type ReceiptScanMatchReportCardProps = {
  report: ReceiptScanMatchReport;
  onDismiss: () => void;
};

function matchLabel(line: ReceiptScanMatchReport["lines"][number]) {
  if (!line.includeInPantry) {
    return `Excluded · ${line.exclusionReason ?? line.lineType}`;
  }

  if (line.matchedIngredientId && line.matchedIngredientName) {
    const prefix =
      line.matchConfidence >= HIGH_CONFIDENCE_MATCH
        ? "Matched"
        : "Possible match";
    const reviewNote =
      line.matchConfidence >= HIGH_CONFIDENCE_MATCH ? "" : " · review required";
    return `${prefix}: ${line.matchedIngredientName}${
      line.matchedCategory ? ` · ${line.matchedCategory}` : ""
    } · ${Math.round(line.matchConfidence * 100)}%${reviewNote}`;
  }

  return `No catalog match · Suggested search: ${
    line.fallbackIngredientName ?? "manual review"
  }`;
}

function quantityLabel(line: ReceiptScanMatchReport["lines"][number]) {
  if (
    line.quantityType === "package_size" &&
    line.purchasedCount !== null &&
    line.quantityPerItem !== null &&
    line.quantityUnit &&
    line.quantity !== null &&
    line.unit
  ) {
    return `${line.purchasedCount} package${line.purchasedCount === 1 ? "" : "s"} × ${line.quantityPerItem} ${line.quantityUnit} = ${line.quantity} ${line.unit}`;
  }

  if (line.quantityType === "measured" && line.quantity !== null && line.unit) {
    return `Measured amount: ${line.quantity} ${line.unit}`;
  }

  if (line.quantity !== null && line.unit) {
    return `Purchased count: ${line.quantity} ${line.unit}`;
  }

  return null;
}

export function ReceiptScanMatchReportCard({
  report,
  onDismiss,
}: ReceiptScanMatchReportCardProps) {
  const receiptDetails = [report.merchantName, report.purchaseDate]
    .filter(Boolean)
    .join(" · ");
  const pantryItems = report.lines.filter(
    (line) => line.includeInPantry,
  ).length;

  return (
    <Card>
      <FlexRow align="between" gap="lg">
        <FlexCol gap="none">
          <Heading level={2} variant="card">
            Receipt match report
          </Heading>
          <Text sx={{ mt: 0.5 }} variant="subtle">
            {receiptDetails || "Scanned receipt"} · {report.lines.length} line
            {report.lines.length === 1 ? "" : "s"} extracted · {pantryItems}{" "}
            pantry item{pantryItems === 1 ? "" : "s"}
          </Text>
        </FlexCol>
        <Button type="button" variant="secondary" onClick={onDismiss}>
          Dismiss
        </Button>
      </FlexRow>

      {report.lines.length === 0 ? (
        <Text sx={{ mt: 2 }} variant="subtle">
          No transaction lines could be extracted from this receipt.
        </Text>
      ) : (
        <List sx={{ mt: 2 }} variant="stack">
          {report.lines.map((line) => {
            const quantity = quantityLabel(line);
            return (
              <Card as="li" key={line.lineNumber} variant="compact">
                <Text sx={{ fontWeight: 700 }}>
                  Line {line.lineNumber}: “{line.sourceText}”
                </Text>
                {line.productName && line.productName !== line.sourceText && (
                  <Text sx={{ mt: 0.5 }} variant="subtle">
                    Interpreted as: {line.productName}
                  </Text>
                )}
                <Text sx={{ mt: 1 }}>{matchLabel(line)}</Text>
                <Text sx={{ mt: 0.5 }} variant="subtle">
                  Why: {line.matchExplanation}
                </Text>
                {quantity && (
                  <Text sx={{ mt: 0.5 }} variant="subtle">
                    Quantity: {quantity}
                  </Text>
                )}
              </Card>
            );
          })}
        </List>
      )}
    </Card>
  );
}
