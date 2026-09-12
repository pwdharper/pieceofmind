export const EMOTIONS = [
  "행복",
  "평온",
  "설렘",
  "불안",
  "슬픔",
  "화남",
  "피곤",
  "무기력",
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
