import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddPantryPage } from "./AddPantryPage.tsx";
import { PantryPage } from "../Pantry/PantryPage.tsx";
import {
  useScannedIngredientsStore,
  type ScannedIngredientDraft,
} from "../../stores/scanned-ingredients-store.ts";

const mocks = vi.hoisted(() => ({
  profile: vi.fn(),
  ingredients: vi.fn(),
  addPantry: vi.fn(),
  pantry: vi.fn(),
  createAdminIngredient: vi.fn(),
  scanReceipt: vi.fn(),
  scanProduct: vi.fn(),
}));
vi.mock("../../lib/api.ts", () => ({ api: mocks }));
vi.mock("../../lib/image-data.ts", () => ({
  prepareImage: vi.fn(async () => "data:image/jpeg;base64,test"),
}));

function draft(
  overrides: Partial<ScannedIngredientDraft> = {},
): Omit<ScannedIngredientDraft, "id"> {
  return {
    source: "receipt",
    productName: "Whole milk",
    productType: "Dairy",
    matchedIngredientId: "milk",
    matchedIngredientName: "Milk",
    matchedIngredientDefaultUnit: "ml",
    matchedCategory: "Dairy",
    matchConfidence: 0.98,
    fallbackIngredientName: "Milk",
    quantity: 1000,
    unit: "ml",
    expiresOn: "2026-10-01",
    confidence: 0.99,
    ...overrides,
  };
}

function renderPage(page = <AddPantryPage />) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{page}</MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  useScannedIngredientsStore.setState({ ingredients: [], receiptScans: [] });
  mocks.profile.mockResolvedValue({ role: "user" });
  mocks.ingredients.mockResolvedValue([
    { id: "milk", name: "Milk", defaultUnit: "ml" },
  ]);
  mocks.pantry.mockResolvedValue([]);
  mocks.addPantry.mockResolvedValue({ id: "saved" });
});
afterEach(cleanup);

describe("pantry ingredient review", () => {
  it("keeps receipt items with unknown quantities editable until an amount is entered", async () => {
    const item = {
      ...draft({ quantity: null }),
      lineNumber: 1,
      sourceText: "MILK",
      lineType: "product",
      includeInPantry: true,
      quantityType: null,
      purchasedCount: null,
      quantityPerItem: null,
      quantityUnit: null,
      unit: null,
      matchExplanation: "Milk matched; quantity needs review.",
    };
    mocks.scanReceipt.mockResolvedValue({
      merchantName: "Market",
      purchaseDate: null,
      lines: [item],
      items: [item],
    });
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Scan receipt" }));
    await userEvent.upload(
      screen.getByLabelText("Receipt photo", { exact: false }),
      new File(["photo"], "receipt.jpg", { type: "image/jpeg" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Read receipt" }));
    const row = within(await screen.findByRole("row", { name: "Whole milk" }));
    const quantity = row.getByRole("spinbutton", { name: "Quantity" });
    expect(quantity).toHaveValue(null);
    expect(
      useScannedIngredientsStore.getState().ingredients[0].quantity,
    ).toBeNull();
    expect(row.getByText("98% match")).toBeVisible();
    expect(screen.queryByText("Excluded")).not.toBeInTheDocument();
    expect(row.getByRole("button", { name: "Add" })).toBeDisabled();
    await userEvent.type(quantity, "500");
    await userEvent.click(row.getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(mocks.addPantry).toHaveBeenCalledWith(
        expect.objectContaining({
          ingredientId: "milk",
          quantity: 500,
          unit: "ml",
        }),
      ),
    );
  });

  it("shows the API's actionable error when a receipt scan is incomplete", async () => {
    mocks.scanReceipt.mockRejectedValue(
      new Error(
        "The receipt scan was cut off before it finished. Try scanning a smaller section of the receipt.",
      ),
    );
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Scan receipt" }));
    await userEvent.upload(
      screen.getByLabelText("Receipt photo", { exact: false }),
      new File(["photo"], "receipt.jpg", { type: "image/jpeg" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Read receipt" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Try scanning a smaller section",
    );
  });
  it("replaces the pantry sidebar with an add-page link beside the title", async () => {
    renderPage(<PantryPage />);
    expect(
      screen.getByRole("link", { name: /Add ingredients/ }),
    ).toHaveAttribute("href", "/pantry/add");
    expect(screen.getByRole("heading", { name: "Your pantry" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Scan groceries" }),
    ).not.toBeInTheDocument();
    await screen.findByText("Your pantry is empty");
  });

  it("groups by catalog confidence and sorts strongest matches first without hiding unmatched items", () => {
    useScannedIngredientsStore.getState().addIngredients([
      draft({
        productName: "Unmatched product",
        matchedIngredientId: null,
        matchedIngredientName: null,
        matchConfidence: 0,
      }),
      draft({ productName: "Possible milk", matchConfidence: 0.6 }),
      draft({ productName: "Likely milk", matchConfidence: 0.8 }),
      draft(),
    ]);
    renderPage();
    const rows = within(screen.getByRole("table"))
      .getAllByRole("row")
      .filter((row) => row.hasAttribute("aria-label"));
    expect(rows.map((row) => row.getAttribute("aria-label"))).toEqual([
      "Whole milk",
      "Likely milk",
      "Possible milk",
      "Unmatched product",
    ]);
    expect(within(rows[2]).getByRole("button", { name: "Add" })).toBeDisabled();
    expect(within(rows[3]).getByText("Unmatched")).toBeVisible();
    expect(within(rows[3]).getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("requires an admin to review a moderate match, then saves edited quantities and expiry", async () => {
    mocks.profile.mockResolvedValue({ role: "admin" });
    useScannedIngredientsStore
      .getState()
      .addIngredients([draft({ matchConfidence: 0.6 })]);
    renderPage();
    const row = within(screen.getByRole("row", { name: "Whole milk" }));
    await waitFor(() => expect(mocks.ingredients).toHaveBeenCalled());
    expect(row.getByRole("button", { name: "Add" })).toBeDisabled();
    await userEvent.click(row.getByRole("button", { name: "Confirm" }));
    expect(row.getByText("Reviewed")).toBeVisible();
    fireEvent.change(row.getByRole("spinbutton", { name: "Quantity" }), {
      target: { value: "2500" },
    });
    await userEvent.click(row.getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(mocks.addPantry).toHaveBeenCalledWith({
        ingredientId: "milk",
        name: "Whole milk",
        quantity: 2500,
        unit: "ml",
        expiresAt: "2026-10-01T12:00:00.000Z",
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("row", { name: "Whole milk" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("supports manual catalog selection and keeps failed additions available for retry", async () => {
    mocks.addPantry.mockRejectedValueOnce(new Error("Unavailable"));
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /Add manually/ }));
    const row = within(screen.getByRole("row", { name: "Manual ingredient" }));
    await userEvent.type(row.getByRole("combobox"), "Milk");
    await screen.findByRole("option", { name: "Milk" });
    await userEvent.keyboard("{Enter}");
    expect(row.getByRole("textbox", { name: "Unit" })).toHaveValue("ml");
    await userEvent.click(row.getByRole("button", { name: "Add" }));
    expect(await row.findByRole("alert")).toHaveTextContent("Could not add");
    await userEvent.click(row.getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("row", { name: "Manual ingredient" }),
      ).not.toBeInTheDocument(),
    );
    expect(mocks.addPantry).toHaveBeenCalledTimes(2);
  });

  it("appends receipt results to existing drafts and displays excluded lines once", async () => {
    useScannedIngredientsStore
      .getState()
      .addIngredients([draft({ productName: "Existing item" })]);
    const milk = {
      ...draft(),
      lineNumber: 1,
      sourceText: "MILK",
      includeInPantry: true,
      lineType: "product",
      matchExplanation: "Milk match",
      quantityType: "package_size",
      purchasedCount: 1,
      quantityPerItem: 1000,
      quantityUnit: "ml",
    };
    mocks.scanReceipt.mockResolvedValue({
      merchantName: "Market",
      purchaseDate: "2026-09-25",
      items: [milk],
      lines: [
        milk,
        {
          ...milk,
          lineNumber: 2,
          productName: null,
          sourceText: "TOTAL 10",
          includeInPantry: false,
          lineType: "total",
          exclusionReason: "Receipt total",
          matchConfidence: 0,
        },
      ],
    });
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Scan receipt" }));
    await userEvent.upload(
      screen.getByLabelText("Receipt photo", { exact: false }),
      new File(["photo"], "receipt.jpg", { type: "image/jpeg" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Read receipt" }));
    expect(
      await screen.findByRole("row", { name: "Whole milk" }),
    ).toBeVisible();
    expect(screen.getByRole("row", { name: "Existing item" })).toBeVisible();
    expect(screen.getAllByText("TOTAL 10")).toHaveLength(1);
    expect(screen.getByText("Receipt total")).toBeVisible();
    expect(
      within(screen.getByRole("row", { name: "Whole milk" })).getByRole(
        "spinbutton",
      ),
    ).toHaveValue(1000);
  });

  it("adds product scans to the same table with the manually entered expiry date", async () => {
    mocks.scanProduct.mockResolvedValue({
      ...draft(),
      expiryDate: "2026-10-03",
    });
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Scan product" }));
    await userEvent.upload(
      screen.getByLabelText("1. Product photo", { exact: false }),
      new File(["photo"], "product.jpg", { type: "image/jpeg" }),
    );
    fireEvent.change(screen.getByLabelText("Or enter expiry date manually"), {
      target: { value: "2026-10-05" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Read product" }));
    const row = within(await screen.findByRole("row", { name: "Whole milk" }));
    expect(row.getByLabelText("Expiry date")).toHaveValue("2026-10-05");
    expect(row.getByRole("textbox", { name: "Unit" })).toHaveValue("ml");
    await userEvent.click(
      row.getByRole("button", { name: "Discard Whole milk" }),
    );
    expect(
      screen.queryByRole("row", { name: "Whole milk" }),
    ).not.toBeInTheDocument();
    expect(mocks.addPantry).not.toHaveBeenCalled();
  });
});
