import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { EmotionIcon } from "../components/EmotionIcon";
import type { Entry } from "../domain/types";
import { formatMonthLabel } from "../lib/formatDate";
import { filterByRange, flowPoints, moodBreakdown, RANGE_LABELS, type ChartRange } from "../lib/insightStats";
import { saveNodePng } from "../lib/saveNodePng";
import { listEntries, todayKey } from "../platform/localEntries";
import "./Insights.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function monthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const lead = first.getDay();
  const cells: Array<number | null> = [...Array(lead).fill(null)];
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function Insights() {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLElement>(null);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [flowRange, setFlowRange] = useState<ChartRange>("month");
  const [moodRange, setMoodRange] = useState<ChartRange>("month");
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const entries = listEntries();
  const byDate = useMemo(() => new Map(entries.map((entry) => [entry.date, entry])), [entries]);
  const cells = monthCells(year, monthIndex);
  const today = todayKey();
  const flow = flowPoints(entries, flowRange, year, monthIndex);
  const moodEntries = filterByRange(entries, moodRange, year, monthIndex);
  const moods = moodBreakdown(moodEntries);

  function shiftMonth(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  }

  function onDay(day: number) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = byDate.get(key);
    if (entry) {
      navigate(`/entries/${entry.id}`, { state: { from: "insights" } });
      return;
    }
    navigate(key === today ? "/" : `/?date=${key}`, { state: { from: "insights" } });
  }

  async function onSaveImage() {
    if (!exportRef.current || saving) return;
    setSaving(true);
    setSaveNote(null);
    try {
      await saveNodePng(exportRef.current, `piece-of-mind-${year}-${String(monthIndex + 1).padStart(2, "0")}.png`);
    } catch {
      setSaveNote("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader title="통계" size="page" />
      <main className="insights-main" ref={exportRef}>
        <div className="insights-download-row">
          <button type="button" className="insights-download" onClick={onSaveImage} disabled={saving}>
            <DownloadIcon />
            {saving ? "저장 중…" : "이미지 저장"}
          </button>
        </div>
        {saveNote ? <p className="insights-save-note">{saveNote}</p> : null}

        <section className="insights-block">
          <p className="calendar-kicker">Calendar</p>
          <div className="calendar-card">
            <div className="month-row">
              <button type="button" className="month-shift" onClick={() => shiftMonth(-1)} aria-label="이전 달">
                ‹
              </button>
              <p className="month-label">{formatMonthLabel(year, monthIndex)}</p>
              <button type="button" className="month-shift" onClick={() => shiftMonth(1)} aria-label="다음 달">
                ›
              </button>
            </div>
            <div className="weekday-row">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="day-grid">
              {cells.map((day, index) => {
                if (!day) return <span key={`e-${index}`} className="day-cell is-empty" />;
                const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const entry = byDate.get(key);
                const isToday = key === today;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`day-cell${isToday ? " is-today" : ""}`}
                    onClick={() => onDay(day)}
                  >
                    {day}
                    {entry ? <EmotionIcon emotion={entry.emotion} colored size={16} /> : <span className="day-icon-slot" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="insights-block">
          <div className="chart-heading">
            <p className="calendar-kicker">Flow</p>
            <RangeSelect value={flowRange} onChange={setFlowRange} />
          </div>
          <div className="calendar-card">
            <FlowChart points={flow} />
          </div>
        </section>

        <section className="insights-block">
          <div className="chart-heading">
            <p className="calendar-kicker">Mood Breakdown</p>
            <RangeSelect value={moodRange} onChange={setMoodRange} />
          </div>
          <div className="mood-card">
            <MoodDonut entries={moodEntries} rows={moods} />
          </div>
        </section>
      </main>
    </>
  );
}

function RangeSelect({ value, onChange }: { value: ChartRange; onChange: (next: ChartRange) => void }) {
  return (
    <label className="range-select">
      <select value={value} onChange={(event) => onChange(event.target.value as ChartRange)}>
        {(Object.keys(RANGE_LABELS) as ChartRange[]).map((range) => (
          <option key={range} value={range}>
            {RANGE_LABELS[range]}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </label>
  );
}

function FlowChart({ points }: { points: { label: string; value: number }[] }) {
  const width = 336;
  const height = 98;
  const pad = 8;
  const max = 5;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((point, index) => {
    const x = index * step;
    const usable = height - pad * 2;
    const y = pad + usable - (point.value / max) * usable;
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <div className="flow-chart">
      <svg className="flow-svg" viewBox={`0 0 ${width} ${height}`} width="100%" height="120" aria-hidden>
        <line x1="0" y1="10" x2={width} y2="10" className="flow-grid" />
        <line x1="0" y1="45" x2={width} y2="45" className="flow-grid" />
        <line x1="0" y1="80" x2={width} y2="80" className="flow-grid" />
        <polygon points={area} className="flow-area" />
        <polyline points={line} className="flow-line" />
        {coords.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="4" className="flow-dot" />
        ))}
      </svg>
      <div className="flow-labels">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

function MoodDonut({
  entries,
  rows,
}: {
  entries: Entry[];
  rows: ReturnType<typeof moodBreakdown>;
}) {
  const size = 170;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <>
      <div className="donut-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle className="donut-track" cx={size / 2} cy={size / 2} r={radius} />
          {rows.map((row) => {
            const length = (row.percent / 100) * circumference;
            const circle = (
              <circle
                key={row.emotion}
                className="donut-seg"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                style={{
                  stroke: `var(--emotion-${row.emotion})`,
                  strokeDasharray: `${length} ${circumference - length}`,
                  strokeDashoffset: -offset,
                }}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="donut-center">
          <p className="donut-count">{entries.length}</p>
          <p className="donut-sub">entries</p>
        </div>
      </div>
      <ul className="mood-legend">
        {rows.length ? (
          rows.map((row) => (
            <li key={row.emotion}>
              <span>
                <i className="legend-dot" style={{ background: `var(--emotion-${row.emotion})` }} />
                {row.emotion}
              </span>
              <b>{row.percent}%</b>
            </li>
          ))
        ) : (
          <li className="legend-empty">아직 기록이 없어요.</li>
        )}
      </ul>
    </>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2v8M5 8l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 3.5L5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
