import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { EmotionIcon } from "../components/EmotionIcon";
import { ThemeCakeIcon } from "../components/ThemeCakeIcon";
import { useLocale } from "../hooks/useLocale";
import { dateFromKey, formatDateLabel } from "../lib/formatDate";
import { originPath, originState, readNavFrom } from "../lib/navFrom";
import { getById } from "../platform/localEntries";
import "./EntryDetail.css";

export function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locale = useLocale();
  const entry = id ? getById(id) : undefined;
  const from = readNavFrom(location.state);
  const fromHome = from === "home";

  if (!entry) {
    return <Navigate to="/" replace />;
  }

  const saved = entry;

  function close() {
    navigate(originPath(from), { state: originState(from) });
  }

  return (
    <>
      <AppHeader onBack={fromHome ? undefined : close} />
      <main className="detail-main">
        <p className="detail-date">{formatDateLabel(dateFromKey(saved.date), locale)}</p>
        <div className="detail-emotion">
          <EmotionIcon emotion={saved.emotion} colored size={72} />
        </div>
        <p className="detail-quote">{saved.text}</p>
        {saved.photoUrl ? (
          <img className="detail-photo" src={saved.photoUrl} alt="붙인 사진" />
        ) : null}
        <hr className="detail-rule" />
        <section className="detail-ai" aria-label="AI 분석">
          <div className="detail-ai-row">
            <span className="ai-tip-face" aria-hidden>
              <ThemeCakeIcon size={32} />
            </span>
            <p className="detail-ai-label">
              '{saved.aiLabel ?? saved.emotion}' {saved.aiPercent ?? 80}% 포착
            </p>
          </div>
          <p className="detail-ai-bubble">
            {saved.aiMessage ?? "오늘 남긴 조각을 소중히 간직해 둘게요."}
          </p>
        </section>
      </main>
      <div className="detail-actions">
        <button
          type="button"
          className="detail-action"
          onClick={() => navigate(`/entries/${saved.id}/edit`, { state: { from } })}
        >
          수정
        </button>
        {fromHome ? null : (
          <button type="button" className="detail-action" onClick={close}>
            닫기
          </button>
        )}
      </div>
    </>
  );
}
