"use client";

import { useEffect, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "elpino.language";
export const LANGUAGE_CHANGE_EVENT = "elpino:language-change";

/** Reads the persisted site language and stays in sync with changes made anywhere (e.g. the header switcher), without a full remount. */
export function useStoredLanguage(): string {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) setLanguageState(stored);

    function handleChange(event: Event) {
      const code = (event as CustomEvent<string>).detail;
      if (code) setLanguageState(code);
    }
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleChange);
  }, []);

  return language;
}

export function setStoredLanguage(code: string) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: code }));
}
