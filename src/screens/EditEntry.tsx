import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { EntryForm } from "../components/EntryForm";
import { useEntryComposer } from "../hooks/useEntryComposer";
import { UI } from "../content/uiCopy";
import { useLocale } from "../hooks/useLocale";
import { dateFromKey, formatDateLabel } from "../lib/formatDate";
import { originPath, originState, readNavFrom } from "../lib/navFrom";
import { requestDetailAi } from "../platform/aiCopy";
import { getSession } from "../platform/auth";
import { getById, upsertEntry } from "../platform/localEntries";

export function EditEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const entry = id ? getById(id) : undefined;
  const from = readNavFrom(location.state);

  if (!entry) {
    return <Navigate to={originPath(from)} replace state={originState(from)} />;
  }

  return (
    <EditForm
      key={entry.id}
      entry={entry}
      from={from}
      onBack={() => navigate(`/entries/${entry.id}`, { state: { from } })}
    />
  );
}

function EditForm({
  entry,
  from,
  onBack,
}: {
  entry: NonNullable<ReturnType<typeof getById>>;
  from: ReturnType<typeof readNavFrom>;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const locale = useLocale();
  const composer = useEntryComposer(entry);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!composer.emotion || !composer.text.trim() || saving) return;
    setSaving(true);
    try {
      const ai = await requestDetailAi(
        locale,
        composer.emotion,
        composer.text.trim(),
        getSession()?.nickname,
      );
      const saved = upsertEntry({
        id: entry.id,
        date: entry.date,
        emotion: composer.emotion,
        text: composer.text.trim(),
        photoUrl: composer.photoUrl,
        ...ai,
      });
      navigate(`/entries/${saved.id}`, { state: { from } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader title={UI[locale].edit.title} onBack={onBack} />
      <EntryForm
        dateLabel={formatDateLabel(dateFromKey(entry.date), locale)}
        composer={composer}
        footer={
          <div className="home-save-block">
            <AppButton disabled={!composer.canSave || saving} onClick={() => void handleSave()}>
              {saving ? UI[locale].home.saving : UI[locale].home.save}
            </AppButton>
          </div>
        }
      />
    </>
  );
}
