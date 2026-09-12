import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { EntryForm } from "../components/EntryForm";
import { useEntryComposer } from "../hooks/useEntryComposer";
import { dateFromKey, formatKoreanDate } from "../lib/formatDate";
import { originPath, originState, readNavFrom } from "../lib/navFrom";
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
  const composer = useEntryComposer(entry);

  function handleSave() {
    if (!composer.emotion || !composer.text.trim()) return;
    upsertEntry({
      id: entry.id,
      date: entry.date,
      emotion: composer.emotion,
      text: composer.text.trim(),
      photoUrl: composer.photoUrl,
    });
    navigate(originPath(from), { state: originState(from) });
  }

  return (
    <>
      <AppHeader title="기록 수정" onBack={onBack} />
      <EntryForm
        dateLabel={formatKoreanDate(dateFromKey(entry.date))}
        composer={composer}
        footer={
          <div className="home-save-block">
            <AppButton disabled={!composer.canSave} onClick={handleSave}>
              저장
            </AppButton>
          </div>
        }
      />
    </>
  );
}
