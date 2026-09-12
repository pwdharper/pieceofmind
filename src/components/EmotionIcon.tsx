import { emotionImages } from "../assets/emotions";
import type { Emotion } from "../domain/types";

export function EmotionIcon({
  emotion,
  colored = false,
  size,
}: {
  emotion: Emotion;
  colored?: boolean;
  size?: number;
}) {
  const leaf = size ?? 64;
  return (
    <span
      className={colored ? "emotion-icon is-colored" : "emotion-icon"}
      style={{
        width: size ?? "var(--emotion-size)",
        height: size ?? "var(--emotion-size)",
        color: colored ? `var(--emotion-${emotion})` : undefined,
      }}
    >
      <img src={emotionImages[emotion]} alt="" width={leaf} height={leaf} />
    </span>
  );
}
