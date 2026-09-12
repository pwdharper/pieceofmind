import { EMOTIONS, type Emotion } from "../domain/types";
import { EmotionIcon } from "./EmotionIcon";
import "./chrome.css";

export function EmotionGrid({
  value,
  onChange,
}: {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
}) {
  return (
    <div className="emotion-grid" role="radiogroup" aria-label="오늘 감정">
      {EMOTIONS.map((emotion) => {
        const selected = value === emotion;
        return (
          <button
            key={emotion}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={emotion}
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
