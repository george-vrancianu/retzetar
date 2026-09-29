import { Box, Stack, mergeSx, type ComponentPropsWithoutRef, type SxProps, type StyleProps, type Theme } from "./internal.ts";
export type NavigationProps = ComponentPropsWithoutRef<"nav"> &
  StyleProps & { gap?: "sm" | "lg" };
export function Navigation({ gap = "sm", sx, ...props }: NavigationProps) {
  return (
    <Stack
      component="nav"
      direction="row"
      sx={mergeSx({ gap: gap === "sm" ? 0.5 : 2 }, sx)}
      {...props}
    />
  );
}

export type ListProps = ComponentPropsWithoutRef<"ul"> &
  StyleProps & {
    ordered?: boolean;
    variant?: "plain" | "stack" | "compact" | "results";
  };
export function List({
  ordered = false,
  variant = "plain",
  sx,
  ...props
}: ListProps) {
  const variants: Record<string, SxProps<Theme>> = {
    plain: {},
    stack: { display: "grid", gap: 1.5 },
    compact: { display: "grid", gap: 1 },
    results: {
      maxHeight: 160,
      overflow: "auto",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
    },
  };
  return (
    <Box
      component={ordered ? "ol" : "ul"}
      sx={mergeSx(
        { m: 0, p: 0, listStyle: ordered ? "decimal" : "none" },
        variants[variant],
        sx,
      )}
      {...props}
    />
  );
}

export function ListItem({
  sx,
  ...props
}: ComponentPropsWithoutRef<"li"> & StyleProps) {
  return <Box component="li" sx={sx} {...props} />;
}

