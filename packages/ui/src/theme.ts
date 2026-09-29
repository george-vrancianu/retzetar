import { createTheme } from "@mui/material/styles";

export const retzetarTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      light: "#dcebdd",
      main: "#315d43",
      dark: "#274b36",
      contrastText: "#ffffff",
    },
    error: {
      light: "#f4c9c0",
      main: "#b64c39",
      dark: "#782d22",
    },
    background: {
      default: "#faf7f0",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c382e",
      secondary: "#526052",
    },
    divider: "#d6ddd5",
    grey: {
      50: "#f6f7f5",
      100: "#e7ebe6",
      200: "#d6ddd5",
      300: "#bdc8bb",
      500: "#6a786c",
      600: "#526052",
      800: "#2c382e",
      900: "#1e291f",
    },
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    h1: { fontWeight: 900, letterSpacing: "-0.025em" },
    h2: { fontWeight: 800, letterSpacing: "-0.015em" },
    h3: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 8 },
        sizeSmall: { minHeight: 36 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#d6ddd5" },
        head: { color: "#526052", fontWeight: 700 },
      },
    },
  },
});
