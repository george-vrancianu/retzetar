import { MuiButton, MuiLink, mergeSx, type ComponentPropsWithoutRef, type ElementType, type PolymorphicProps, type StyleProps } from "./internal.ts";
export type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "color"> &
  StyleProps & {
    variant?: "primary" | "secondary" | "text" | "danger";
    size?: "default" | "small";
    block?: boolean;
  };
export function Button({
  variant = "primary",
  size = "default",
  block = false,
  sx,
  ...props
}: ButtonProps) {
  const muiVariant =
    variant === "primary"
      ? "contained"
      : variant === "secondary"
        ? "outlined"
        : "text";
  const muiColor: "error" | "primary" =
    variant === "danger" ? "error" : "primary";
  return (
    <MuiButton
      variant={muiVariant}
      color={muiColor}
      size={size === "small" ? "small" : "medium"}
      fullWidth={block}
      sx={sx}
      {...props}
    />
  );
}

export type ActionLinkProps<T extends ElementType = "a"> = PolymorphicProps<
  T,
  {
    variant?: "primary" | "secondary" | "text" | "title" | "brand" | "nav";
    active?: boolean;
    block?: boolean;
  }
>;
export function ActionLink<T extends ElementType = "a">({
  as,
  variant = "text",
  active = false,
  block = false,
  sx,
  ...props
}: ActionLinkProps<T>) {
  const component = (as ?? "a") as ElementType;
  if (variant === "primary" || variant === "secondary") {
    return (
      <MuiButton
        component={component}
        variant={variant === "primary" ? "contained" : "outlined"}
        fullWidth={block}
        sx={sx}
        {...(props as object)}
      />
    );
  }
  if (variant === "nav") {
    return (
      <MuiButton
        component={component}
        variant="text"
        color="inherit"
        sx={mergeSx(
          {
            minHeight: 40,
            whiteSpace: "nowrap",
            px: 1.5,
            py: 1,
            color: active ? "primary.main" : "text.secondary",
            bgcolor: active ? "primary.light" : "transparent",
            "&[aria-current=page]": {
              bgcolor: "primary.light",
              color: "primary.main",
            },
            "&:hover": { bgcolor: active ? "primary.light" : "grey.100" },
          },
          sx,
        )}
        {...(props as object)}
      />
    );
  }
  const linkStyles = {
    text: { fontWeight: 600 },
    title: { fontWeight: 700 },
    brand: { fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.025em" },
  };
  return (
    <MuiLink
      component={component}
      color="primary"
      underline="hover"
      sx={mergeSx(
        linkStyles[variant],
        block && { display: "block", width: "100%" },
        sx,
      )}
      {...(props as object)}
    />
  );
}

