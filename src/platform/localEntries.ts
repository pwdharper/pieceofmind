import { fallbackDetailAi } from "../content/detailAi";
import { EMOTIONS, type Emotion, type Entry } from "../domain/types";

const KEY = "pom.entries";

const LEGACY_EMOTION: Record<string, Emotion> = {
  행복: "very-good",
  평온: "good",
  설렘: "calm",
  불안: "neutral",
  슬픔: "worried",
  화남: "sad",
  피곤: "angry",
  무기력: "very-bad",
};

function isEmotion(value: string): value is Emotion {
  return (EMOTIONS as readonly string[]).includes(value);
}

function normalizeEmotion(value: unknown): Emotion | null {
  if (typeof value !== "string") return null;
  if (isEmotion(value)) return value;
  return LEGACY_EMOTION[value] ?? null;
}

function readAll(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Entry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      const emotion = normalizeEmotion(entry.emotion);
      return emotion ? [{ ...entry, emotion }] : [];
    });
  } catch {
    return [];
  }
}

function writeAll(entries: Entry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getByDate(date: string): Entry | undefined {
  return readAll().find((entry) => entry.date === date);
}

export function getById(id: string): Entry | undefined {
  return readAll().find((entry) => entry.id === id);
}

export function listEntries(): Entry[] {
  return readAll();
}

export function upsertEntry(partial: Omit<Entry, "id"> & { id?: string }): Entry {
  const entries = readAll();
  const existing = entries.find((entry) => entry.date === partial.date);
  const ai =
    partial.aiLabel && partial.aiMessage
      ? {
          aiLabel: partial.aiLabel,
          aiPercent: partial.aiPercent ?? 80,
          aiMessage: partial.aiMessage,
        }
      : fallbackDetailAi(partial.emotion, partial.text);
  const next: Entry = {
    id: existing?.id ?? partial.id ?? crypto.randomUUID(),
    date: partial.date,
    emotion: partial.emotion,
    text: partial.text,
    photoUrl: partial.photoUrl,
    ...ai,
  };
  const others = entries.filter((entry) => entry.date !== partial.date);
  writeAll([next, ...others]);
  return next;
}
