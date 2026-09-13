import { LOCALES, THEME_IDS, type Locale, type ThemeId } from "../domain/types";
import { applyCake } from "../theme/cakes";

const PREFS_KEY = "pom.prefs";
const SESSION_KEY = "pom.session";

type Prefs = {
  themeId: ThemeId;
  locale: Locale;
};

type Session = {
  email: string;
};

const DEFAULTS: Prefs = { themeId: "cream", locale: "ko" };

function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      themeId: isThemeId(parsed.themeId) ? parsed.themeId : DEFAULTS.themeId,
      locale: isLocale(parsed.locale) ? parsed.locale : DEFAULTS.locale,
    };
  } catch {
    return DEFAULTS;
  }
}

function writePrefs(prefs: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function getPrefs(): Prefs {
  return readPrefs();
}

export function setThemeId(themeId: ThemeId) {
  const prefs = { ...readPrefs(), themeId };
  writePrefs(prefs);
  applyCake(themeId);
}

const LOCALE_EVENT = "pom:locale";

export function setLocale(locale: Locale) {
  writePrefs({ ...readPrefs(), locale });
  document.documentElement.lang = locale;
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

export function subscribeLocale(listener: () => void) {
  window.addEventListener(LOCALE_EVENT, listener);
  return () => window.removeEventListener(LOCALE_EVENT, listener);
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

export function setSession(email: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function hydrateTheme() {
  const prefs = readPrefs();
  applyCake(prefs.themeId);
  document.documentElement.lang = prefs.locale;
}
