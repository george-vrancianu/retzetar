import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, SearchCombobox } from "@retzetar/ui";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

function ComboboxHarness({ onSelect }: { onSelect: (id: string) => void }) {
  const [value, setValue] = useState("to");
  return (
    <SearchCombobox
      label="Find ingredient"
      value={value}
      onChange={setValue}
      options={[
        { id: "tomato", label: "Tomato" },
        { id: "tofu", label: "Tofu" },
      ]}
      onSelect={(option) => onSelect(option.id)}
    />
  );
}

describe("shared UI primitives", () => {
  it("appends consumer classes after component classes", () => {
    render(<Button className="custom-class">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" }).className).toMatch(
      /font-semibold.*custom-class$/,
    );
  });

  it("supports keyboard selection in the pantry combobox", async () => {
    const onSelect = vi.fn();
    render(<ComboboxHarness onSelect={onSelect} />);

    const input = screen.getByRole("combobox", { name: "Find ingredient" });
    const listbox = screen.getByRole("listbox", { name: "Search results" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);

    await userEvent.type(input, "{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith("tofu");
    expect(listbox).not.toBeVisible();
  });
});
