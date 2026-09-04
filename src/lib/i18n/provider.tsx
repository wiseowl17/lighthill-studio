import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Copy, type Locale } from "./copy";

const STORAGE_KEY = "lighthill-lang";

type I18nValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  copy: Copy;
};

const I18nContext = createContext<I18nValue | null>(null);

function readStored(): Locale | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "en" || value === "es") return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function LanguageProvider({
  children,
  preferEs = false,
}: {
  children: ReactNode;
  preferEs?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(preferEs ? "es" : "en");

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setLocaleState(stored);
      return;
    }
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("es") || preferEs) setLocaleState("es");
  }, [preferEs]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    return {
      locale,
      setLocale: (next) => {
        setLocaleState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
        document.documentElement.lang = next;
      },
      copy: dictionaries[locale],
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "en",
      setLocale: () => undefined,
      copy: dictionaries.en,
    };
  }
  return ctx;
}
