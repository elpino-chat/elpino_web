"use client";

export const LANGUAGES = [
  { code: "cs", name: "Czech", countryCode: "cz" },
  { code: "da", name: "Danish", countryCode: "dk" },
  { code: "de", name: "Deutsch", countryCode: "de" },
  { code: "en", name: "English", countryCode: "gb" },
  { code: "es", name: "Español", countryCode: "es" },
  { code: "fi", name: "Finnish", countryCode: "fi" },
  { code: "fr", name: "Français", countryCode: "fr" },
  { code: "hu", name: "Hungarian", countryCode: "hu" },
  { code: "id", name: "Indonesian", countryCode: "id" },
  { code: "it", name: "Italian", countryCode: "it" },
  { code: "ja", name: "Japanese", countryCode: "jp" },
  { code: "ko", name: "Korean", countryCode: "kr" },
  { code: "nl", name: "Dutch", countryCode: "nl" },
  { code: "pl", name: "Polish", countryCode: "pl" },
  { code: "pt", name: "Portuguese", countryCode: "pt" },
  { code: "pt-br", name: "Portuguese (Brazil)", countryCode: "br" },
  { code: "ro", name: "Romanian", countryCode: "ro" },
  { code: "ru", name: "Russian", countryCode: "ru" },
  { code: "sv", name: "Swedish", countryCode: "se" },
  { code: "th", name: "Thai", countryCode: "th" },
  { code: "tr", name: "Turkish", countryCode: "tr" },
  { code: "uk", name: "Ukrainian", countryCode: "ua" },
  { code: "vi", name: "Vietnamese", countryCode: "vn" },
  { code: "zh-tw", name: "Chinese (Taiwan)", countryCode: "tw" },
];

export function FlagImage({ countryCode, alt }: { countryCode: string; alt: string }) {
  return (
    <img
      src={`https://flagsapi.com/${countryCode.toUpperCase()}/flat/32.png`}
      alt={alt}
      className="h-4 w-5 rounded-sm object-cover"
    />
  );
}

export function LanguageSwitcher({
  language,
  onChange,
  light,
  open,
  onOpenChange,
  compact = false,
}: {
  language: string;
  onChange: (code: string) => void;
  light: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Icon-only, no name label at any width — for tight spaces like the desktop header's action row. */
  compact?: boolean;
}) {
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES.find((l) => l.code === "en")!;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={compact ? `Language: ${current.name}` : undefined}
        className={`flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition ${
          light
            ? "text-[#26332d] hover:bg-[#f0f4ef]"
            : "text-white/90 hover:bg-white/[0.07]"
        }`}
      >
        <FlagImage countryCode={current.countryCode} alt={current.code} />
        <span className={compact ? "hidden" : "hidden sm:inline"}>{current.name}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-56 overflow-y-auto rounded-xl border border-black/5 bg-white shadow-lg">
            <div className="space-y-1 p-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onChange(lang.code);
                    onOpenChange(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    language === lang.code ? "bg-blue-50 text-blue-900" : "text-black/70 hover:bg-black/[0.03] hover:text-black"
                  }`}
                >
                  <FlagImage countryCode={lang.countryCode} alt={lang.code} />
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
