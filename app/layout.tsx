import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { ThemeProvider } from "./components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const ibmPlexArabic = localFont({
  src: "../public/fonts/IBMPlexSansArabic-Regular.ttf",
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "AL-MANARA",
  description: "Car Store ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning // prevent the simple mismatch warning during hydration when the server-rendered HTML doesn't match the client-rendered HTML
      // because using "next-themes" to manage themes, the server will render the default theme (dark) while the client may switch to a different theme (e.g., light) based on user preference, causing a mismatch during hydration
      lang="en"
      className={`
          ${inter.variable}
          ${manrope.variable}
          ${ibmPlexArabic.variable}
          min-h-screen
        `}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
