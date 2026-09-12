import { EMOTIONS, type Emotion, type Entry } from "../domain/types";
import { dateFromKey } from "./formatDate";

export type ChartRange = "month" | "week" | "year";

export const RANGE_LABELS: Record<ChartRange, string> = {
  month: "This Month",
  week: "This Week",
  year: "This Year",
};

const VALENCE: Record<Emotion, number> = {
  행복: 5,
  설렘: 4,
  평온: 4,
  피곤: 2,
  불안: 2,
  슬픔: 1,
  화남: 1,
  무기력: 1,
};

function inMonth(entry: Entry, year: number, monthIndex: number) {
  return entry.date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}-`);
}

function weekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

export function filterByRange(entries: Entry[], range: ChartRange, year: number, monthIndex: number): Entry[] {
  if (range === "month") return entries.filter((entry) => inMonth(entry, year, monthIndex));
  if (range === "year") return entries.filter((entry) => entry.date.startsWith(`${year}-`));

  const start = weekStart(new Date());
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return entries.filter((entry) => {
    const date = dateFromKey(entry.date);
    return date >= start && date < end;
  });
}

export function flowPoints(
  entries: Entry[],
  range: ChartRange,
  year: number,
  monthIndex: number,
): { label: string; value: number }[] {
  const scoped = filterByRange(entries, range, year, monthIndex);

  if (range === "week") {
    return ["일", "월", "화", "수", "목", "금", "토"].map((label, weekday) => {
      const dayEntries = scoped.filter((entry) => dateFromKey(entry.date).getDay() === weekday);
      return { label, value: averageValence(dayEntries) };
    });
  }

  if (range === "year") {
    return Array.from({ length: 12 }, (_, month) => {
      const monthEntries = scoped.filter((entry) => Number(entry.date.slice(5, 7)) === month + 1);
      return { label: `${month + 1}월`, value: averageValence(monthEntries) };
    });
  }

  const weeks = [1, 2, 3, 4].map((week) => {
    const weekEntries = scoped.filter((entry) => {
      const day = Number(entry.date.slice(8, 10));
      const bucket = Math.min(4, Math.ceil(day / 7));
      return bucket === week;
    });
    return { label: `Wk ${week}`, value: averageValence(weekEntries) };
  });
  return weeks;
}

export function moodBreakdown(entries: Entry[]): { emotion: Emotion; count: number; percent: number }[] {
  const total = entries.length;
  return EMOTIONS.map((emotion) => {
    const count = entries.filter((entry) => entry.emotion === emotion).length;
    return { emotion, count, percent: total ? Math.round((count / total) * 100) : 0 };
  }).filter((row) => row.count > 0);
}

function averageValence(entries: Entry[]) {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + VALENCE[entry.emotion], 0) / entries.length;
}
