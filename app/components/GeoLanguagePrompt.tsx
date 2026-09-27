"use client";

import { useEffect, useState } from "react";
import { LANGUAGES, FlagImage } from "./LanguageSwitcher";
import { LANGUAGE_STORAGE_KEY, setStoredLanguage } from "../hooks/useStoredLanguage";

const GEO_COOKIE = "elpino-geo-country";
const DISMISSED_KEY = "elpino.geoPromptDismissed";

const INK = "#11120f";
const BLUE = "#3784ff";
const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

// Cloudflare's CF-IPCountry (relayed to the browser as a cookie by
// proxy.ts) maps to one of our 24 supported languages. One country per
// language — ambiguous ones (Canada, Switzerland, Belgium) are left out
// rather than guessed, so the prompt only fires when it's actually likely
// to be right.
const COUNTRY_TO_LANG: Record<string, string> = {
  CZ: "cs",
  DK: "da",
  DE: "de",
  AT: "de",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  FI: "fi",
  FR: "fr",
  LU: "fr",
  MC: "fr",
  HU: "hu",
  ID: "id",
  IT: "it",
  JP: "ja",
  KR: "ko",
  NL: "nl",
  PL: "pl",
  PT: "pt",
  BR: "pt-br",
  RO: "ro",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  SE: "sv",
  TH: "th",
  TR: "tr",
  UA: "uk",
  VN: "vi",
  TW: "zh-tw",
};

// Shown once, only when there's a country to act on: read the CF-IPCountry
// cookie, look up its language, and — only if the visitor hasn't already
// picked a language or dismissed this before — offer the switch. Answering
// either way (yes or no, backdrop click, or Escape) is remembered, so this
// never nags twice.
export function GeoLanguagePrompt() {
  const [suggested, setSuggested] = useState<{ code: string; name: string; countryCode: string } | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(LANGUAGE_STORAGE_KEY)) return; // already chose a language
      if (localStorage.getItem(DISMISSED_KEY)) return; // already asked
    } catch {
      return; // no storage (private browsing) — skip rather than nag every load
    }

    // In local dev there's no Cloudflare in front of you, so the real
    // cookie never gets set — ?debug_geo=DE lets you preview the prompt
    // without deploying. Has no effect once a real geo cookie exists.
    const debugCountry = new URLSearchParams(window.location.search).get("debug_geo");
    const country =
      debugCountry ??
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${GEO_COOKIE}=`))
        ?.split("=")[1];
    if (!country) return;

    const langCode = COUNTRY_TO_LANG[country.toUpperCase()];
    if (!langCode || langCode === "en") return;

    const lang = LANGUAGES.find((l) => l.code === langCode);
    if (lang) setSuggested(lang);
  }, []);

  function respond(switchLanguage: boolean) {
    if (switchLanguage && suggested) setStoredLanguage(suggested.code);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Non-fatal — worst case it asks again next visit.
    }
    setSuggested(null);
  }

  useEffect(() => {
    if (!suggested) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") respond(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggested]);

  if (!suggested) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#11120f]/55 p-5 backdrop-blur-sm animate-[elpino-focus_0.3s_ease-out_both]"
      role="dialog"
      aria-modal="true"
      aria-label="Switch site language"
      onClick={() => respond(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-white text-[#11120f] shadow-[8px_8px_0_0_#11120f]"
        style={{ animation: "elpino-rv-pop .35s both" }}
      >
        {/* header strip */}
        <div className="relative overflow-hidden border-b-2 border-[#11120f] px-6 pb-7 pt-6" style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-20" style={dots} />
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#11120f]">
              Language
            </span>
            <button
              type="button"
              onClick={() => respond(false)}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#11120f] bg-white text-[#11120f] transition hover:bg-[#ffd84d]"
            >
              ✕
            </button>
          </div>
          <div className="relative mt-5 flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#11120f] bg-white">
              <FlagImage countryCode={suggested.countryCode} alt={suggested.name} />
            </span>
            <h2 className="text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-white">
              Switch to {suggested.name}?
            </h2>
          </div>
        </div>

        {/* body */}
        <div className="px-6 py-6">
          <p className="text-[15px] leading-7 text-[#11120f]/70">
            Looks like you&apos;re visiting from a place where <span className="font-semibold text-[#11120f]">{suggested.name}</span> is spoken. We can switch the whole site to it — you can always change it later from the language menu.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => respond(true)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] px-5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5"
              style={{ backgroundColor: BLUE }}
            >
              Switch to {suggested.name}
            </button>
            <button
              type="button"
              onClick={() => respond(false)}
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#11120f] bg-white px-5 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5 hover:bg-[#fff8ec]"
            >
              Keep English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
