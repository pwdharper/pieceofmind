import type { ReactNode } from "react";
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
  return (
    <svg
      className={colored ? "emotion-icon is-colored" : "emotion-icon"}
      width={size ?? 58}
      height={size ?? 58}
      viewBox="0 0 44 44"
      fill="none"
      style={{
        color: colored ? `var(--emotion-${emotion})` : "var(--text)",
        width: size ?? "var(--emotion-size)",
        height: size ?? "var(--emotion-size)",
      }}
      aria-hidden
    >
      <circle className="emotion-disk" cx="22" cy="22" r="20" strokeWidth="1.6" />
      {FACES[emotion]}
    </svg>
  );
}

const FACES: Record<Emotion, ReactNode> = {
  행복: (
    <>
      <circle className="emotion-mark" cx="15" cy="18" r="1.4" />
      <circle className="emotion-mark" cx="29" cy="18" r="1.4" />
      <path className="emotion-line" d="M14 26c2.4 4 13.6 4 16 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  평온: (
    <>
      <circle className="emotion-mark" cx="15" cy="18" r="1.4" />
      <circle className="emotion-mark" cx="29" cy="18" r="1.4" />
      <path className="emotion-line" d="M15 27h14" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  설렘: (
    <>
      <path className="emotion-line" d="M13 17h6M25 17h6" strokeWidth="1.6" strokeLinecap="round" />
      <path className="emotion-line" d="M14 26c2.6 5 13.4 5 16 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  불안: (
    <>
      <circle className="emotion-mark" cx="15" cy="18" r="1.4" />
      <circle className="emotion-mark" cx="29" cy="18" r="1.4" />
      <path className="emotion-line" d="M16 28c3-3 9-3 12 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  슬픔: (
    <>
      <circle className="emotion-mark" cx="15" cy="19" r="1.4" />
      <circle className="emotion-mark" cx="29" cy="19" r="1.4" />
      <path className="emotion-line" d="M16 30c3-4 9-4 12 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  화남: (
    <>
      <path className="emotion-line" d="M11 14l7 3M33 14l-7 3" strokeWidth="1.6" strokeLinecap="round" />
      <circle className="emotion-mark" cx="15" cy="20" r="1.4" />
      <circle className="emotion-mark" cx="29" cy="20" r="1.4" />
      <path className="emotion-line" d="M16 30c3-4 9-4 12 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  피곤: (
    <>
      <path className="emotion-line" d="M12 18h7M25 18h7" strokeWidth="1.6" strokeLinecap="round" />
      <path className="emotion-line" d="M15 27h14" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  무기력: (
    <>
      <circle className="emotion-mark" cx="15" cy="19" r="1.4" />
      <circle className="emotion-mark" cx="29" cy="19" r="1.4" />
      <path className="emotion-line" d="M16 29c2.5-1.5 9.5-1.5 12 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};
