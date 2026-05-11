"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LanguageToggleProps = {
  locale: "en" | "ar";
};

export function LanguageToggle({ locale }: LanguageToggleProps) {
  const pathname = usePathname();

  const targetLocale = locale === "ar" ? "en" : "ar";

  const targetPath = pathname.replace(`/${locale}`, `/${targetLocale}`);

  return (
    <Link
      href={targetPath}
      className="flex h-10  items-center justify-center rounded-lg border border-white/10 bg-[var(--card)] px-4 text-sm font-medium shadow"
    >
      {targetLocale === "ar" ? "العربية" : "English"}
    </Link>
  );
}
