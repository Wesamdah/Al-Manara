import "server-only";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  ar: () => import("./ar.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === "en" || locale === "ar";
}
