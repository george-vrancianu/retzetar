import { Box, Typography, mergeSx, type ComponentPropsWithoutRef, type ElementType, type PolymorphicProps, type SxProps, type StyleProps, type Theme } from "./internal.ts";
export type HeadingProps = ComponentPropsWithoutRef<"h1"> &
  StyleProps & {
    level?: 1 | 2 | 3;
    variant?: "page" | "display" | "section" | "card";
  };
export function Heading({
  level = 1,
  variant = "page",
  sx,
  ...props
}: HeadingProps) {
  const variants: Record<string, SxProps<Theme>> = {
    page: { fontSize: { xs: "1.875rem", sm: "2.25rem" }, fontWeight: 900 },
    display: { fontSize: { xs: "2.25rem", sm: "3rem" }, fontWeight: 900 },
    section: { fontSize: "1.5rem", fontWeight: 700 },
    card: { fontSize: "1.25rem", fontWeight: 700 },
  };
  return (
    <Typography
      component={`h${level}`}
      sx={mergeSx({ lineHeight: 1.2 }, variants[variant], sx)}
      {...props}
    />
  );
}

export type TextProps<T extends ElementType = "p"> = PolymorphicProps<
  T,
  {
    variant?:
      | "body"
      | "muted"
      | "subtle"
      | "small"
      | "label"
      | "eyebrow"
      | "metric"
      | "danger"
      | "success";
  }
>;
export function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  sx,
  ...props
}: TextProps<T>) {
  const variants: Record<string, SxProps<Theme>> = {
    body: {},
    muted: { color: "text.secondary" },
    subtle: { color: "text.secondary", fontSize: "0.875rem" },
    small: { fontSize: "0.875rem" },
    label: { fontWeight: 600 },
    eyebrow: { fontWeight: 600, color: "primary.light" },
    metric: { fontSize: "1.875rem", fontWeight: 900, color: "primary.main" },
    danger: { fontSize: "0.875rem", color: "error.dark" },
    success: { fontSize: "0.875rem", fontWeight: 600, color: "primary.main" },
  };
  return (
    <Typography
      component={(as ?? "p") as ElementType}
      sx={mergeSx(variants[variant], sx)}
      {...(props as object)}
    />
  );
}

export type VisuallyHiddenProps<T extends ElementType = "span"> =
  PolymorphicProps<T>;
export function VisuallyHidden<T extends ElementType = "span">({
  as,
  sx,
  ...props
}: VisuallyHiddenProps<T>) {
  return (
    <Box
      component={(as ?? "span") as ElementType}
      sx={mergeSx(
        {
          border: 0,
          clip: "rect(0 0 0 0)",
          height: 1,
          margin: -1,
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          whiteSpace: "nowrap",
          width: 1,
        },
        sx,
      )}
      {...(props as object)}
    />
  );
}

