import { AppBar, Box, Toolbar, mergeSx, type ComponentPropsWithoutRef, type StyleProps } from "./internal.ts";
export function AppShell({
  sx,
  ...props
}: ComponentPropsWithoutRef<"div"> & StyleProps) {
  return <Box sx={mergeSx({ minHeight: "100vh" }, sx)} {...props} />;
}

export function AppHeader({
  sx,
  ...props
}: Omit<ComponentPropsWithoutRef<"header">, "color"> & StyleProps) {
  return (
    <AppBar
      component="header"
      position="static"
      elevation={0}
      sx={mergeSx(
        {
          borderBottom: 1,
          borderColor: "primary.light",
          bgcolor: "background.paper",
          color: "text.primary",
        },
        sx,
      )}
      {...(props as object)}
    />
  );
}

export function AppHeaderInner({
  sx,
  ...props
}: ComponentPropsWithoutRef<"div"> & StyleProps) {
  return (
    <Toolbar
      disableGutters
      sx={mergeSx(
        {
          width: "100%",
          maxWidth: 1152,
          mx: "auto",
          px: 2,
          py: 2,
          minHeight: "unset",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 2,
        },
        sx,
      )}
      {...props}
    />
  );
}

export function AppMain({
  wide = false,
  sx,
  ...props
}: ComponentPropsWithoutRef<"main"> & StyleProps & { wide?: boolean }) {
  return (
    <Box
      component="main"
      sx={mergeSx(
        {
          width: "100%",
          maxWidth: wide ? 1600 : 1152,
          mx: "auto",
          px: 2,
          py: 4,
        },
        sx,
      )}
      {...props}
    />
  );
}
