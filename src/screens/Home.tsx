import { useMemo } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AiTip } from "../components/AiTip";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { EntryForm } from "../components/EntryForm";
import { pickHomeTip } from "../content/homeTips";
import { useEntryComposer } from "../hooks/useEntryComposer";
import { dateFromKey, formatKoreanDate, isDateKey } from "../lib/formatDate";
import { readNavFrom } from "../lib/navFrom";
import { getByDate, todayKey, upsertEntry } from "../platform/localEntries";

export function Home() {
  const [params] = useSearchParams();
  const dateParam = params.get("date");
  const date = isDateKey(dateParam) ? dateParam : todayKey();
  const existing = getByDate(date);

  if (existing) {
    return <Navigate to={`/entries/${existing.id}`} replace state={{ from: "home" }} />;
  }

  return <HomeComposer key={date} date={date} />;
}

function HomeComposer({ date }: { date: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const composer = useEntryComposer();
  const tip = useMemo(() => pickHomeTip(), []);
  const isToday = date === todayKey();

  function handleSave() {
    if (!composer.emotion || !composer.text.trim()) return;
    const entry = upsertEntry({
      date,
      emotion: composer.emotion,
      text: composer.text.trim(),
      photoUrl: composer.photoUrl,
    });
    navigate(`/entries/${entry.id}`, { state: { from: readNavFrom(location.state) } });
  }

  return (
    <>
      <AppHeader />
      <EntryForm
        dateLabel={formatKoreanDate(dateFromKey(date))}
        composer={composer}
        footer={
          <div className="home-save-block">
            <AppButton disabled={!composer.canSave} onClick={handleSave}>
              저장
            </AppButton>
            {isToday ? <AiTip text={tip} /> : null}
          </div>
        }
      />
    </>
  );
}
