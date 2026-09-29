import { MuiAlert, Box, CircularProgress, Paper, Skeleton, Typography, mergeSx, type ComponentPropsWithoutRef, type ReactNode, type StyleProps } from "./internal.ts";
import { Button } from "./actions.tsx";
export type AlertProps = ComponentPropsWithoutRef<"div"> &
  StyleProps & { variant?: "error" | "info" };
export function Alert({ variant = "error", sx, ...props }: AlertProps) {
  return (
    <MuiAlert
      severity={variant}
      role={variant === "error" ? "alert" : "status"}
      sx={sx}
      {...(props as object)}
    />
  );
}

export function Status({
  sx,
  ...props
}: ComponentPropsWithoutRef<"p"> & StyleProps) {
  return (
    <Typography
      component="p"
      role="status"
      sx={mergeSx(
        { color: "primary.main", fontSize: "0.875rem", fontWeight: 600 },
        sx,
      )}
      {...props}
    />
  );
}

export function LoadingState({
  label = "Loading",
  sx,
  ...props
}: ComponentPropsWithoutRef<"p"> & StyleProps & { label?: string }) {
  return (
    <Paper
      component="p"
      role="status"
      elevation={0}
      sx={mergeSx(
        {
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          border: 1,
          borderColor: "divider",
          p: 2.5,
          color: "text.secondary",
          boxShadow: 1,
        },
        sx,
      )}
      {...props}
    >
      <CircularProgress size={20} />
      {label}…
      <Skeleton sx={{ flex: 1, maxWidth: 180 }} />
    </Paper>
  );
}

export type EmptyStateProps = ComponentPropsWithoutRef<"div"> &
  StyleProps & {
    title: ReactNode;
    action?: ReactNode;
  };
export function EmptyState({ title, action, sx, ...props }: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      sx={mergeSx(
        {
          border: 1,
          borderColor: "divider",
          p: 2.5,
          textAlign: "center",
          boxShadow: 1,
        },
        sx,
      )}
      {...props}
    >
      <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Paper>
  );
}

export type ErrorStateProps = ComponentPropsWithoutRef<"div"> &
  StyleProps & {
    message: ReactNode;
    retry?: () => void;
  };
export function ErrorState({ message, retry, sx, ...props }: ErrorStateProps) {
  return (
    <Paper
      role="alert"
      elevation={0}
      sx={mergeSx(
        { border: 1, borderColor: "error.light", p: 2.5, boxShadow: 1 },
        sx,
      )}
      {...props}
    >
      <Typography sx={{ color: "error.dark", fontWeight: 600 }}>
        {message}
      </Typography>
      {retry && (
        <Button
          sx={{ mt: 1.5 }}
          variant="secondary"
          type="button"
          onClick={retry}
        >
          Try again
        </Button>
      )}
    </Paper>
  );
}

