import { useEffect, useState } from "react";
import type { Locale } from "../domain/types";
import { getPrefs, subscribeLocale } from "../platform/prefs";

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(() => getPrefs().locale);
  useEffect(() => subscribeLocale(() => setLocale(getPrefs().locale)), []);
  return locale;
}
