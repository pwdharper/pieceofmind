const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatKoreanDate(date = new Date()): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isDateKey(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return todayKeyFromParts(value) === value;
}

function todayKeyFromParts(key: string): string {
  const date = dateFromKey(key);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonthLabel(year: number, monthIndex: number): string {
  return `${year}년 ${monthIndex + 1}월`;
}
