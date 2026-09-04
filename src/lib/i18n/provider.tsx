import { useMemo, type ReactNode } from "react";
import { dictionaries, type Copy, type Locale } from "./copy";

type I18nValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  copy: Copy;
};

const english: I18nValue = {
  locale: "en",
  setLocale: () => undefined,
  copy: dictionaries.en,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nValue>(() => english, []);
  return <>{children}</>;
}

export function useI18n(): I18nValue {
  return english;
}
