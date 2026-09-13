import type { Emotion, Locale } from "../domain/types";

export const EMOTION_LABELS: Record<Locale, Record<Emotion, string>> = {
  ko: {
    행복: "행복",
    평온: "평온",
    설렘: "설렘",
    불안: "불안",
    슬픔: "슬픔",
    화남: "화남",
    피곤: "피곤",
    무기력: "무기력",
  },
  en: {
    행복: "Happy",
    평온: "Calm",
    설렘: "Excited",
    불안: "Anxious",
    슬픔: "Sad",
    화남: "Angry",
    피곤: "Tired",
    무기력: "Drained",
  },
};

export const UI = {
  ko: {
    nav: { home: "홈", insights: "통계", settings: "설정", menu: "주요 메뉴" },
    home: {
      greeting: "오늘 기분은 어때요?",
      placeholder: "오늘 하루를 자유롭게 적어보세요.\n마음의 조각을 남겨봐요.",
      chars: "자",
      photo: "사진 추가",
      photoAlt: "붙인 사진",
      photoRemove: "사진 삭제",
      voice: "음성 기록",
      listening: "듣는 중…",
      save: "저장",
      emotions: "오늘 감정",
    },
    edit: { title: "기록 수정", back: "뒤로" },
    insights: {
      title: "통계",
      saveImage: "이미지 저장",
      saving: "저장 중…",
      saveFail: "이미지를 저장하지 못했어요. 다시 시도해 주세요.",
      prevMonth: "이전 달",
      nextMonth: "다음 달",
      weekdays: ["일", "월", "화", "수", "목", "금", "토"],
      empty: "아직 기록이 없어요.",
    },
    speech: {
      unsupported: "이 브라우저에서는 음성 기록을 지원하지 않아요. Chrome에서 열어 주세요.",
      notAllowed: "마이크 권한이 필요해요. 주소창에서 마이크를 허용해 주세요.",
      network: "음성 인식에 네트워크가 필요해요. 연결을 확인해 주세요.",
      failed: "음성을 글자로 바꾸지 못했어요.",
    },
  },
  en: {
    nav: { home: "Home", insights: "Insights", settings: "Settings", menu: "Main menu" },
    home: {
      greeting: "How are you feeling today?",
      placeholder: "Write about your day freely.\nLeave a piece of your mind.",
      chars: "",
      photo: "Add photo",
      photoAlt: "Attached photo",
      photoRemove: "Remove photo",
      voice: "Voice note",
      listening: "Listening…",
      save: "Save",
      emotions: "Today's mood",
    },
    edit: { title: "Edit entry", back: "Back" },
    insights: {
      title: "Insights",
      saveImage: "Save image",
      saving: "Saving…",
      saveFail: "Couldn't save the image. Please try again.",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      empty: "No entries yet.",
    },
    speech: {
      unsupported: "Voice notes aren't supported in this browser. Please open Chrome.",
      notAllowed: "Microphone access is needed. Allow the mic in the address bar.",
      network: "Voice recognition needs a network connection.",
      failed: "Couldn't turn speech into text.",
    },
  },
} as const;

export type SpeechErrorId = keyof (typeof UI)["en"]["speech"];
