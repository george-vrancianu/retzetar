import { Box, CardMedia, mergeSx, type ReactNode, type StyleProps } from "./internal.ts";
export type MediaProps = StyleProps & {
  src?: string | null;
  alt: string;
  fallback?: ReactNode;
  variant?: "card" | "detail";
};
export function Media({
  src,
  alt,
  fallback = "Recipe",
  variant = "card",
  sx,
}: MediaProps) {
  const variants = {
    card: { height: 176, width: "100%", objectFit: "cover" as const },
    detail: {
      maxHeight: 384,
      width: "100%",
      borderRadius: 3,
      objectFit: "cover" as const,
    },
  };
  if (src)
    return (
      <CardMedia
        component="img"
        image={src}
        alt={alt}
        sx={mergeSx(variants[variant], sx)}
      />
    );
  return (
    <Box
      sx={mergeSx(
        variants[variant],
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.light",
          color: "primary.main",
        },
        sx,
      )}
      aria-hidden="true"
    >
      {fallback}
    </Box>
  );
}

