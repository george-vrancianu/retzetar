import { CssBaseline, ThemeProvider, retzetarTheme, type ReactNode } from "./internal.ts";
export function RetzetarUiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={retzetarTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
