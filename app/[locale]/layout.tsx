import { isValidLocale, type Locale } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import { LanguageToggle } from "../components/LanguageToggle";
import { ThemeToggle } from "../components/theme/ThemeToggle";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex flex-col  bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex items-center justify-end gap-4 p-4">
        <ThemeToggle />
        <LanguageToggle locale={locale} />
      </div>
      <div lang={locale as Locale} dir={direction}>
        {children}
      </div>
    </div>
  );
}
