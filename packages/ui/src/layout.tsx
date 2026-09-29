import { Box, Paper, Stack, mergeSx, type ComponentPropsWithoutRef, type ElementType, type PolymorphicProps, type SxProps, type StyleProps, type Theme } from "./internal.ts";
export function CenteredLayout({
  sx,
  ...props
}: ComponentPropsWithoutRef<"main"> & StyleProps) {
  return (
    <Box
      component="main"
      sx={mergeSx(
        {
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 6,
        },
        sx,
      )}
      {...props}
    />
  );
}

export type PageProps<T extends ElementType = "section"> = PolymorphicProps<T>;
export function Page<T extends ElementType = "section">({
  as,
  sx,
  ...props
}: PageProps<T>) {
  return (
    <Box
      component={(as ?? "section") as ElementType}
      sx={sx}
      {...(props as object)}
    />
  );
}

export function PageHeader({
  sx,
  ...props
}: ComponentPropsWithoutRef<"header"> & StyleProps) {
  return (
    <Box
      component="header"
      sx={mergeSx(
        {
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        },
        sx,
      )}
      {...props}
    />
  );
}

export type SectionProps<T extends ElementType = "section"> = PolymorphicProps<
  T,
  { spacing?: "none" | "sm" | "md" | "lg" }
>;
export function Section<T extends ElementType = "section">({
  as,
  spacing = "none",
  sx,
  ...props
}: SectionProps<T>) {
  const spacingValues = { none: 0, sm: 2, md: 3, lg: 4 };
  return (
    <Box
      component={(as ?? "section") as ElementType}
      sx={mergeSx({ mt: spacingValues[spacing] }, sx)}
      {...(props as object)}
    />
  );
}

export type CardProps<T extends ElementType = "div"> = PolymorphicProps<
  T,
  { variant?: "default" | "compact" | "flush" | "hero" }
>;
export function Card<T extends ElementType = "div">({
  as,
  variant = "default",
  sx,
  ...props
}: CardProps<T>) {
  const variants: Record<string, SxProps<Theme>> = {
    default: { border: 1, borderColor: "divider", p: 2.5, boxShadow: 1 },
    compact: { border: 1, borderColor: "divider", p: 2, boxShadow: 1 },
    flush: {
      border: 1,
      borderColor: "divider",
      overflow: "hidden",
      boxShadow: 1,
    },
    hero: {
      borderRadius: 3,
      bgcolor: "primary.main",
      color: "primary.contrastText",
      px: { xs: 3, sm: 5 },
      py: 5,
    },
  };
  return (
    <Paper
      component={(as ?? "div") as ElementType}
      elevation={0}
      sx={mergeSx(variants[variant], sx)}
      {...(props as object)}
    />
  );
}

export type FlexRowProps = ComponentPropsWithoutRef<"div"> &
  StyleProps & {
    align?: "center" | "start" | "between";
    gap?: "sm" | "md" | "lg";
    wrap?: boolean;
  };
export function FlexRow({
  align = "center",
  gap = "md",
  wrap = false,
  sx,
  ...props
}: FlexRowProps) {
  const gaps = { sm: 1, md: 1.5, lg: 2 };
  const alignment = {
    center: { alignItems: "center" },
    start: { alignItems: "flex-start" },
    between: { alignItems: "center", justifyContent: "space-between" },
  };
  return (
    <Stack
      direction="row"
      sx={mergeSx(
        {
          gap: gaps[gap],
          flexWrap: wrap ? "wrap" : "nowrap",
          ...alignment[align],
        },
        sx,
      )}
      {...props}
    />
  );
}

export type FlexColProps<T extends ElementType = "div"> = PolymorphicProps<
  T,
  { gap?: "none" | "sm" | "md" | "lg" }
>;
export function FlexCol<T extends ElementType = "div">({
  as,
  gap = "md",
  sx,
  ...props
}: FlexColProps<T>) {
  const gaps = { none: 0, sm: 1, md: 1.5, lg: 2.5 };
  return (
    <Stack
      component={(as ?? "div") as ElementType}
      sx={mergeSx({ gap: gaps[gap] }, sx)}
      {...(props as object)}
    />
  );
}

export type GridProps = ComponentPropsWithoutRef<"div"> &
  StyleProps & {
    variant?: "cards" | "two" | "sidebar" | "detail" | "fields";
  };
export function Grid({ variant = "cards", sx, ...props }: GridProps) {
  const variants: Record<string, SxProps<Theme>> = {
    cards: {
      display: "grid",
      gap: 2.5,
      gridTemplateColumns: {
        sm: "repeat(2,minmax(0,1fr))",
        lg: "repeat(3,minmax(0,1fr))",
      },
    },
    two: {
      display: "grid",
      gap: 2.5,
      gridTemplateColumns: { md: "repeat(2,minmax(0,1fr))" },
    },
    sidebar: {
      display: "grid",
      alignItems: "start",
      gap: 3,
      gridTemplateColumns: { lg: "minmax(0,1fr) 22rem" },
    },
    detail: {
      display: "grid",
      gap: 4,
      gridTemplateColumns: { lg: "minmax(0,2fr) minmax(18rem,1fr)" },
    },
    fields: {
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      gap: 1.5,
    },
  };
  return <Box sx={mergeSx(variants[variant], sx)} {...props} />;
}

