import type { Emotion } from "../domain/types";

type DetailAi = {
  aiLabel: string;
  aiPercent: number;
  aiMessage: string;
};

const FALLBACKS: Record<Emotion, DetailAi> = {
  행복: {
    aiLabel: "보람찬 행복",
    aiPercent: 82,
    aiMessage:
      "애쓴 하루의 끝이 따뜻하게 남아 있어요. 홀가분해진 마음 뒤에 애쓴 시간이 느껴집니다. 오늘은 스스로를 위해 천천히 쉬어 보는 건 어떨까요? 정말 수고 많았어요.",
  },
  평온: {
    aiLabel: "고요한 평온",
    aiPercent: 76,
    aiMessage:
      "마음이 잠시 숨을 고르고 있네요. 잔잔한 하루도 충분히 소중한 조각입니다. 이 고요함을 조금만 더 곁에 두어도 좋아요.",
  },
  설렘: {
    aiLabel: "설레는 기대",
    aiPercent: 80,
    aiMessage:
      "앞으로 펼쳐질 순간에 마음이 반짝이고 있어요. 그 설렘을 서두르지 않아도 괜찮아요. 오늘 느낀 두근거림을 그대로 간직해 보세요.",
  },
  불안: {
    aiLabel: "흔들리는 마음",
    aiPercent: 74,
    aiMessage:
      "확신이 없어도 기록을 남긴 것만으로 이미 한 걸음이에요. 불안은 잠시 머물다 갈 수 있어요. 지금은 깊게 숨 한 번만 쉬어도 충분합니다.",
  },
  슬픔: {
    aiLabel: "잔잔한 슬픔",
    aiPercent: 78,
    aiMessage:
      "마음이 젖어 있는 날도 있어요. 슬픈 감정을 밀어내지 않아도 됩니다. 오늘 남긴 한 줄이 내일의 나를 조금 더 다정하게 바라보게 할 거예요.",
  },
  화남: {
    aiLabel: "뜨거운 마음",
    aiPercent: 81,
    aiMessage:
      "화가 난 마음에도 지키고 싶은 것이 있었겠어요. 그 온도를 알아채 준 것만으로도 충분합니다. 잠시 몸을 풀고 나면 조금 더 가벼워질 수 있어요.",
  },
  피곤: {
    aiLabel: "깊은 피로",
    aiPercent: 77,
    aiMessage:
      "많이 애쓴 하루였나 봐요. 피곤함은 몸이 보내는 정직한 신호예요. 오늘은 할 일을 줄이고 휴식을 조금 더 허락해 주세요.",
  },
  무기력: {
    aiLabel: "가라앉은 마음",
    aiPercent: 73,
    aiMessage:
      "아무것도 하기 싫은 날에도 여기 앉아 한 조각을 남겼어요. 그것만으로 충분합니다. 무리하지 말고, 천천히 올라와도 괜찮아요.",
  },
};

function hashText(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

export function fallbackDetailAi(emotion: Emotion, text = ""): DetailAi {
  const base = FALLBACKS[emotion];
  const salt = hashText(text.trim());
  return {
    aiLabel: base.aiLabel,
    aiPercent: 70 + (salt % 19),
    aiMessage: base.aiMessage,
  };
}
