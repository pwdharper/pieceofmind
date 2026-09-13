import { EMOTION_LABELS, UI } from "../content/uiCopy";
import { EMOTIONS, type Emotion } from "../domain/types";
import { useLocale } from "../hooks/useLocale";
import { EmotionIcon } from "./EmotionIcon";
import "./chrome.css";

export function EmotionGrid({
  value,
  onChange,
}: {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
}) {
  const locale = useLocale();
  return (
    <div className="emotion-grid" role="radiogroup" aria-label={UI[locale].home.emotions}>
      {EMOTIONS.map((emotion) => {
        const selected = value === emotion;
        return (
          <button
            key={emotion}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={EMOTION_LABELS[locale][emotion]}
            className={selected ? "emotion-btn is-selected" : "emotion-btn"}
            onClick={() => onChange(emotion)}
          >
            <span className="emotion-face">
              <EmotionIcon emotion={emotion} colored={selected} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
