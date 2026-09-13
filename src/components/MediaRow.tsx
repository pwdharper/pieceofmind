import { UI } from "../content/uiCopy";
import { useLocale } from "../hooks/useLocale";
import "./chrome.css";

export function MediaRow({
  listening,
  speechError,
  onPhoto,
  onVoice,
}: {
  listening: boolean;
  speechError: string | null;
  onPhoto: (file: File) => void;
  onVoice: () => void;
}) {
  const t = UI[useLocale()].home;
  return (
    <div className="media-block">
      <div className="media-row">
        <label className="chip-btn">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPhoto(file);
              event.target.value = "";
            }}
          />
          <CameraIcon />
          {t.photo}
        </label>
        <button type="button" className="chip-btn" onClick={onVoice} aria-pressed={listening}>
          <MicIcon />
          {listening ? t.listening : t.voice}
        </button>
      </div>
      {speechError ? <p className="media-error">{speechError}</p> : null}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 4.5l1.2-2h3.6L12 4.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="6.5" y="1.5" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 8.5a5.5 5.5 0 0011 0M9 14v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
