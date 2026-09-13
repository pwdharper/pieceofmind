import { EMOTIONS, type Emotion, type Entry } from "../domain/types";
import { dateFromKey } from "./formatDate";

export type ChartRange = "month" | "week" | "year";

export const RANGE_LABELS: Record<ChartRange, string> = {
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

export const RANGE_ORDER: ChartRange[] = ["week", "month", "year"];

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

export function moodBreakdown(entries: Entry[]): { emotion: Emotion; count: number; percent: number }[] {
  const total = entries.length;
  return EMOTIONS.map((emotion) => {
    const count = entries.filter((entry) => entry.emotion === emotion).length;
    return { emotion, count, percent: total ? Math.round((count / total) * 100) : 0 };
  }).filter((row) => row.count > 0);
}
