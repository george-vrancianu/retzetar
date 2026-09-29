import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoPicker, RetzetarUiProvider } from "@retzetar/ui";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

function Picker({
  multiple = false,
  uploading = false,
  progress,
}: {
  multiple?: boolean;
  uploading?: boolean;
  progress?: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <RetzetarUiProvider>
      <PhotoPicker
        label="Grocery photos"
        files={files}
        onFilesChange={setFiles}
        multiple={multiple}
        uploading={uploading}
        progress={progress}
      />
    </RetzetarUiProvider>
  );
}

describe("PhotoPicker", () => {
  it("offers distinct camera and upload actions and replaces a single selection", async () => {
    render(<Picker />);
    const camera = screen.getByLabelText(
      "Take photo with camera",
    ) as HTMLInputElement;
    const upload = screen.getByLabelText("Grocery photos") as HTMLInputElement;
    expect(camera).toHaveAttribute("capture", "environment");
    expect(upload).not.toHaveAttribute("capture");
    expect(upload).not.toHaveAttribute("multiple");
    expect(screen.getByRole("button", { name: "Take a photo" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Upload a photo" }),
    ).toBeVisible();
    await userEvent.upload(
      upload,
      new File(["one"], "one.jpg", { type: "image/jpeg" }),
    );
    await userEvent.upload(
      upload,
      new File(["two"], "two.jpg", { type: "image/jpeg" }),
    );
    expect(screen.queryByText("one.jpg")).not.toBeInTheDocument();
    expect(screen.getByText("two.jpg")).toBeVisible();
  });

  it("adds multiple selections and allows removing a photo", async () => {
    render(<Picker multiple />);
    const upload = screen.getByLabelText("Grocery photos") as HTMLInputElement;
    expect(upload).toHaveAttribute("multiple");
    await userEvent.upload(upload, [
      new File(["one"], "one.jpg", { type: "image/jpeg" }),
      new File(["two"], "two.png", { type: "image/png" }),
    ]);
    await userEvent.upload(
      upload,
      new File(["three"], "three.webp", { type: "image/webp" }),
    );
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove two.png" }),
    );
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("two.png")).not.toBeInTheDocument();
  });

  it("shows determinate progress when provided and a busy state otherwise", () => {
    const { rerender } = render(<Picker uploading progress={42} />);
    expect(screen.getByText("Uploading photo… 42%")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
    expect(
      screen.getByRole("button", { name: "Upload a photo" }),
    ).toBeDisabled();
    rerender(<Picker uploading />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });
});
