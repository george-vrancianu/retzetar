export {
  Alert as MuiAlert,
  AppBar,
  Autocomplete,
  Box,
  Button as MuiButton,
  CardMedia,
  Checkbox as MuiCheckbox,
  Chip as MuiChip,
  CircularProgress,
  CssBaseline,
  FormControlLabel,
  Link as MuiLink,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
export type { SxProps, Theme } from "@mui/material/styles";
export {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useState,
} from "react";
export type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  ReactNode,
} from "react";
export { retzetarTheme } from "./theme.ts";

import type { SxProps, Theme } from "@mui/material/styles";
import type { ComponentPropsWithoutRef, ElementType } from "react";

export const mergeSx = (
  ...styles: Array<SxProps<Theme> | false | null | undefined>
): SxProps<Theme> => styles.filter(Boolean) as SxProps<Theme>;

export type StyleProps = { sx?: SxProps<Theme>; className?: string };
export type PolymorphicProps<T extends ElementType, OwnProps = object> = OwnProps &
  StyleProps & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof OwnProps | "as" | "sx"
  >;
