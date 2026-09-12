import { fallbackDetailAi } from "../content/detailAi";
import type { Entry } from "../domain/types";

const KEY = "pom.entries";

function readAll(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Entry[];
    return Array.isArray(parsed) ? parsed : [];
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
  const ai = existing?.aiLabel
    ? {
        aiLabel: existing.aiLabel,
        aiPercent: existing.aiPercent,
        aiMessage: existing.aiMessage,
      }
    : fallbackDetailAi(partial.emotion);
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
