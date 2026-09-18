import { fallbackDetailAi } from "../content/detailAi";
import { EMOTIONS, type Emotion, type Entry } from "../domain/types";
import { supabase } from "./supabase";

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

type EntryRow = {
  id: string;
  user_id: string;
  entry_date: string;
  emotion: string;
  body: string;
  photo_url: string | null;
  ai_label: string | null;
  ai_percent: number | null;
  ai_message: string | null;
};

let cache: Entry[] = [];
let cloud = false;

function isEmotion(value: string): value is Emotion {
  return (EMOTIONS as readonly string[]).includes(value);
}

function normalizeEmotion(value: unknown): Emotion | null {
  if (typeof value !== "string") return null;
  if (isEmotion(value)) return value;
  return LEGACY_EMOTION[value] ?? null;
}

function readGuest(): Entry[] {
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

function writeGuest(entries: Entry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function fromRow(row: EntryRow): Entry | null {
  const emotion = normalizeEmotion(row.emotion);
  if (!emotion) return null;
  return {
    id: row.id,
    date: row.entry_date,
    emotion,
    text: row.body,
    photoUrl: row.photo_url ?? undefined,
    aiLabel: row.ai_label ?? undefined,
    aiPercent: row.ai_percent ?? undefined,
    aiMessage: row.ai_message ?? undefined,
  };
}

function toRow(entry: Entry, userId: string): EntryRow {
  return {
    id: entry.id,
    user_id: userId,
    entry_date: entry.date,
    emotion: entry.emotion,
    body: entry.text,
    photo_url: entry.photoUrl ?? null,
    ai_label: entry.aiLabel ?? null,
    ai_percent: entry.aiPercent ?? null,
    ai_message: entry.aiMessage ?? null,
  };
}

async function currentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function fetchRemote(): Promise<Entry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("entries").select("*").order("entry_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    const entry = fromRow(row as EntryRow);
    return entry ? [entry] : [];
  });
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function hydrateEntries(loggedIn: boolean) {
  if (!(loggedIn && supabase)) {
    cache = readGuest();
    cloud = false;
    return;
  }
  const userId = await currentUserId();
  if (!userId) {
    cache = readGuest();
    cloud = false;
    return;
  }
  try {
    const guest = readGuest();
    let remote = await fetchRemote();
    const remoteDates = new Set(remote.map((entry) => entry.date));
    const fresh = guest.filter((entry) => !remoteDates.has(entry.date));
    if (fresh.length) {
      const { error } = await supabase.from("entries").insert(fresh.map((entry) => toRow(entry, userId)));
      if (!error) {
        remote = await fetchRemote();
        writeGuest([]);
      }
    } else {
      writeGuest([]);
    }
    cache = remote;
    cloud = true;
  } catch {
    cache = readGuest();
    cloud = false;
  }
}

export function getByDate(date: string): Entry | undefined {
  return cache.find((entry) => entry.date === date);
}

export function getById(id: string): Entry | undefined {
  return cache.find((entry) => entry.id === id);
}

export function listEntries(): Entry[] {
  return cache;
}

export async function upsertEntry(partial: Omit<Entry, "id"> & { id?: string }): Promise<Entry> {
  const existing = cache.find((entry) => entry.date === partial.date);
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
  cache = [next, ...cache.filter((entry) => entry.date !== partial.date)];
  if (cloud && supabase) {
    const userId = await currentUserId();
    if (!userId) throw new Error("not signed in");
    const { error } = await supabase.from("entries").upsert(
      { ...toRow(next, userId), updated_at: new Date().toISOString() },
      { onConflict: "user_id,entry_date" },
    );
    if (error) throw error;
  } else {
    writeGuest(cache);
  }
  return next;
}
