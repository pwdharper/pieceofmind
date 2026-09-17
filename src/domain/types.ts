export const EMOTIONS = [
  "very-good",
  "good",
  "calm",
  "neutral",
  "worried",
  "sad",
  "angry",
  "very-bad",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export type Entry = {
  id: string;
  date: string;
  emotion: Emotion;
  text: string;
  photoUrl?: string;
  aiLabel?: string;
  aiPercent?: number;
  aiMessage?: string;
};

export const MAX_TEXT = 200;

export const THEME_IDS = ["cream", "cheese"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
