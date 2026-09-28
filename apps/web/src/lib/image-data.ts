const MAX_IMAGE_EDGE = 2800;
const JPEG_QUALITY = 0.9;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The photo could not be read"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () =>
      reject(new Error("The photo format is not supported"));
    image.onload = () => resolve(image);
    image.src = source;
  });
}

export async function prepareImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file");
  }

  const source = await readFile(file);
  const image = await loadImage(source);
  const scale = Math.min(
    1,
    MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot prepare the photo");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
