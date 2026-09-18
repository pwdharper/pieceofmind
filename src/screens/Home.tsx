import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AiTip } from "../components/AiTip";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { EntryForm } from "../components/EntryForm";
import { UI } from "../content/uiCopy";
import { pickHomeTip } from "../content/homeTips";
import { useEntryComposer } from "../hooks/useEntryComposer";
import { useLocale } from "../hooks/useLocale";
import { dateFromKey, formatDateLabel, isDateKey } from "../lib/formatDate";
import { readNavFrom } from "../lib/navFrom";
import { requestDetailAi, requestHomeTip } from "../platform/aiCopy";
import { displayNickname, getSession } from "../platform/auth";
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
  const locale = useLocale();
  const composer = useEntryComposer();
  const [tip, setTip] = useState(() => pickHomeTip(locale));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    const cacheKey = `pom.homeTip.${date}.${locale}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setTip(cached);
      return () => {
        alive = false;
      };
    }
    void requestHomeTip(locale).then((text) => {
      if (!alive) return;
      setTip(text);
      sessionStorage.setItem(cacheKey, text);
    });
    return () => {
      alive = false;
    };
  }, [date, locale]);

  async function handleSave() {
    if (!composer.emotion || !composer.text.trim() || saving) return;
    setSaving(true);
    try {
      const ai = await requestDetailAi(
        locale,
        composer.emotion,
        composer.text.trim(),
        displayNickname(getSession(), locale),
      );
      const entry = await upsertEntry({
        date,
        emotion: composer.emotion,
        text: composer.text.trim(),
        photoUrl: composer.photoUrl,
        ...ai,
      });
      navigate(`/entries/${entry.id}`, { state: { from: readNavFrom(location.state) } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader />
      <EntryForm
        dateLabel={formatDateLabel(dateFromKey(date), locale)}
        composer={composer}
        footer={
          <div className="home-save-block">
            <AppButton disabled={!composer.canSave || saving} onClick={() => void handleSave()}>
              {saving ? UI[locale].home.saving : UI[locale].home.save}
            </AppButton>
            <AiTip text={tip} />
          </div>
        }
      />
    </>
  );
}
