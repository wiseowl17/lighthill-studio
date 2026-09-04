import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, copy } = useI18n();
  return (
    <div
      className={cn("flex items-center gap-1 text-[0.72rem] font-medium tracking-[0.16em] uppercase", className)}
      role="group"
      aria-label={copy.langSwitch}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "px-1.5 py-1 transition-colors",
          locale === "en" ? "text-fg" : "text-fg-muted hover:text-fg",
        )}
        aria-pressed={locale === "en"}
      >
        {copy.langEn}
      </button>
      <span className="text-fg-subtle" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("es")}
        className={cn(
          "px-1.5 py-1 transition-colors",
          locale === "es" ? "text-fg" : "text-fg-muted hover:text-fg",
        )}
        aria-pressed={locale === "es"}
      >
        {copy.langEs}
      </button>
    </div>
  );
}
