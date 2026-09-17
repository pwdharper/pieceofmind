import { EMOTION_LABELS } from "./uiCopy";
import type { Emotion, Locale } from "../domain/types";

export type DetailAi = {
  aiLabel: string;
  aiPercent: number;
  aiMessage: string;
};

const LABEL_PREFIX: Record<Emotion, Record<Locale, string>> = {
  "very-good": { ko: "보람찬", en: "Bright" },
  good: { ko: "따뜻한", en: "Warm" },
  calm: { ko: "고요한", en: "Quiet" },
  neutral: { ko: "담담한", en: "Steady" },
  worried: { ko: "흔들리는", en: "Uneasy" },
  sad: { ko: "잔잔한", en: "Tender" },
  angry: { ko: "뜨거운", en: "Heated" },
  "very-bad": { ko: "가라앉은", en: "Heavy" },
};

const FALLBACK_BODY: Record<Emotion, Record<Locale, { empathy: string; action: string }>> = {
  "very-good": {
    ko: {
      empathy: "고른 아주 좋음이 이 기록에도 따뜻하게 남아 있어요.",
      action: "좋아하는 노래 한 곡만 틀어 두는 건 어떨까요?",
    },
    en: {
      empathy: "The very-good face you picked still sits warmly in this note.",
      action: "Play one favorite song and stay with it for a minute.",
    },
  },
  good: {
    ko: {
      empathy: "고른 좋음이 잔잔히 남아 있는 하루로 읽혀요.",
      action: "창밖을 1분만 바라보며 이 기분을 조금 더 곁에 두어도 좋아요.",
    },
    en: {
      empathy: "The good you picked reads as a quiet, kind day.",
      action: "Look out a window for a minute and keep the feeling nearby.",
    },
  },
  calm: {
    ko: {
      empathy: "고른 편안함처럼 몸과 마음이 잠시 내려앉아 있어요.",
      action: "어깨를 한번 내리고 숨 세 번만 천천히 쉬어 보세요.",
    },
    en: {
      empathy: "The calm you picked feels like the body getting to rest.",
      action: "Drop the shoulders once and take three slow breaths.",
    },
  },
  neutral: {
    ko: {
      empathy: "고른 보통처럼 큰 파동 없이도 오늘을 남긴 조각이에요.",
      action: "발바닥이 바닥에 닿는 감각만 한번 느껴 보세요.",
    },
    en: {
      empathy: "The okay you picked is still a real piece of today.",
      action: "Feel both feet on the floor for a moment.",
    },
  },
  worried: {
    ko: {
      empathy: "고른 걱정이 이 글에도 남아 있어요. 확신이 없어도 괜찮아요.",
      action: "보이는 물건 세 개만 천천히 말해 보세요.",
    },
    en: {
      empathy: "The worry you picked is still in this note, and that is allowed.",
      action: "Name three things you can see, slowly.",
    },
  },
  sad: {
    ko: {
      empathy: "고른 슬픔을 밀어내지 않아도 됩니다. 마음이 젖은 날도 있어요.",
      action: "창문을 조금 열고 바람 한 번만 쐬어 보는 건 어떨까요?",
    },
    en: {
      empathy: "The sadness you picked does not have to be pushed away.",
      action: "Open a window and let a little air in.",
    },
  },
  angry: {
    ko: {
      empathy: "고른 화남에도 지키고 싶은 것이 있었겠어요.",
      action: "어깨를 한번 털고 일어나 방 안을 한 바퀴만 돌아 보세요.",
    },
    en: {
      empathy: "The anger you picked likely had something it was protecting.",
      action: "Shake out the shoulders and walk once around the room.",
    },
  },
  "very-bad": {
    ko: {
      empathy: "고른 매우 나쁨처럼 무거운 날에도 한 조각을 남기셨어요.",
      action: "물 한 모금만 마셔 봐도 괜찮아요.",
    },
    en: {
      empathy: "The very-bad you picked is heavy, and you still left a note.",
      action: "Take one sip of water. That is enough.",
    },
  },
};

function hashText(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function compact(value: string) {
  return value.replace(/\s+/g, "").replace(/[.,!?…~'"“”‘’]/g, "");
}

export function labelUsesEmotion(label: string, emotion: Emotion, locale: Locale) {
  const word = EMOTION_LABELS[locale][emotion];
  const trimmed = label.trim();
  if (emotion === "good") {
    return locale === "ko"
      ? trimmed.endsWith("좋음") && !trimmed.endsWith("아주 좋음")
      : /Good$/i.test(trimmed) && !/Very good$/i.test(trimmed);
  }
  if (emotion === "very-good") {
    return locale === "ko" ? trimmed.endsWith("아주 좋음") : /Very good$/i.test(trimmed);
  }
  return trimmed.endsWith(word);
}

function diaryIsReflected(message: string, diary: string) {
  const excerpt = diary.trim();
  if (!excerpt) return true;
  const compactedDiary = compact(excerpt);
  const compactedMessage = compact(message);
  if (compactedDiary.length >= 4 && compactedMessage.includes(compactedDiary.slice(0, Math.min(12, compactedDiary.length)))) {
    return true;
  }
  if (compactedDiary && compactedMessage.includes(compactedDiary)) return true;
  return excerpt
    .split(/\s+/)
    .map((token) => token.replace(/[.,!?…~'"“”‘’]/g, ""))
    .filter((token) => token.length >= 2)
    .some((token) => message.includes(token));
}

function diaryLead(diary: string, locale: Locale) {
  const excerpt = diary.trim().replace(/\s+/g, " ");
  if (!excerpt) return "";
  const short = excerpt.length > 28 ? `${excerpt.slice(0, 28)}…` : excerpt;
  return locale === "en" ? `You wrote "${short}". ` : `'${short}'라고 남기셨네요. `;
}

export function finishDetailAi(
  emotion: Emotion,
  diary: string,
  locale: Locale,
  raw: { aiLabel: string; aiPercent: number; aiMessage: string },
): DetailAi {
  const word = EMOTION_LABELS[locale][emotion];
  const aiLabel = labelUsesEmotion(raw.aiLabel, emotion, locale)
    ? raw.aiLabel.trim()
    : `${LABEL_PREFIX[emotion][locale]} ${word}`;
  const aiMessage = diaryIsReflected(raw.aiMessage, diary)
    ? raw.aiMessage.trim()
    : `${diaryLead(diary, locale)}${raw.aiMessage.trim()}`;
  return {
    aiLabel,
    aiPercent: Math.min(88, Math.max(70, Math.round(raw.aiPercent))),
    aiMessage,
  };
}

export function fallbackDetailAi(emotion: Emotion, text = "", locale: Locale = "ko"): DetailAi {
  const body = FALLBACK_BODY[emotion][locale];
  const salt = hashText(text.trim());
  return finishDetailAi(emotion, text, locale, {
    aiLabel: `${LABEL_PREFIX[emotion][locale]} ${EMOTION_LABELS[locale][emotion]}`,
    aiPercent: 70 + (salt % 19),
    aiMessage: `${diaryLead(text, locale)}${body.empathy} ${body.action}`,
  });
}
