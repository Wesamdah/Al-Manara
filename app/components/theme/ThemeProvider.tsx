"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class" // theme will be applied as a class to the root element (e.g., <html class="dark">)
      defaultTheme="dark"
      enableSystem={false} // disable automatic theme switching based on the user's system preferences
    >
      {children}
    </NextThemesProvider>
  );
}
