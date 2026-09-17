import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const EMOTIONS = [
  "very-good",
  "good",
  "calm",
  "neutral",
  "worried",
  "sad",
  "angry",
  "very-bad",
] as const;

type Emotion = (typeof EMOTIONS)[number];
type Locale = "ko" | "en";

export type AiCopyRequest =
  | { kind: "home-tip"; locale: Locale }
  | { kind: "detail"; locale: Locale; emotion: Emotion; text: string; nickname?: string };

export type AiCopyResponse =
  | { kind: "home-tip"; text: string }
  | { kind: "detail"; aiLabel: string; aiPercent: number; aiMessage: string };

const EMOTION_LABELS: Record<Locale, Record<Emotion, string>> = {
  ko: {
    "very-good": "아주 좋음",
    good: "좋음",
    calm: "편안함",
    neutral: "보통",
    worried: "걱정",
    sad: "슬픔",
    angry: "화남",
    "very-bad": "매우 나쁨",
  },
  en: {
    "very-good": "Very good",
    good: "Good",
    calm: "Calm",
    neutral: "Okay",
    worried: "Worried",
    sad: "Sad",
    angry: "Angry",
    "very-bad": "Very bad",
  },
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

const MODEL = anthropic("claude-haiku-4-5");

function anthropicKey() {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.ANTHROPIC_API_KEY;
}

function stripWrap(text: string) {
  return text.trim().replace(/^["'“”]+|["'“”]+$/g, "").trim();
}

function compact(value: string) {
  return value.replace(/\s+/g, "").replace(/[.,!?…~'"“”‘’]/g, "");
}

function labelUsesEmotion(label: string, emotion: Emotion, locale: Locale) {
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

function finishDetailAi(
  emotion: Emotion,
  diary: string,
  locale: Locale,
  raw: { aiLabel: string; aiPercent: number; aiMessage: string },
) {
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

function parseDetail(raw: string): Extract<AiCopyResponse, { kind: "detail" }> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("bad_json");
  const parsed = JSON.parse(match[0]) as {
    aiLabel?: unknown;
    aiPercent?: unknown;
    aiMessage?: unknown;
  };
  const aiLabel = String(parsed.aiLabel ?? "").trim();
  const aiMessage = String(parsed.aiMessage ?? "").trim();
  const percent = Number(parsed.aiPercent);
  if (!aiLabel || !aiMessage) throw new Error("bad_json");
  return {
    kind: "detail",
    aiLabel,
    aiPercent: Number.isFinite(percent) ? Math.min(88, Math.max(70, Math.round(percent))) : 80,
    aiMessage,
  };
}

const ACTION_GUIDES: Record<Emotion, { ko: string; en: string }> = {
  "very-good": {
    ko: "아주 좋음에 먼저 공감한 뒤, 일기 속 말을 짚고, 이 기분을 조금 더 머물게 할 작은 행동 하나. 예: 좋아하는 노래 한 곡, 따뜻한 음료 한 모금, 좋았던 순간 한 줄 적기. 감정 이름을 바꾸지 마세요.",
    en: "Empathize with feeling very good, then one tiny way to stay with it: play one favorite song, sip something warm, or jot one good moment.",
  },
  good: {
    ko: "좋음에 공감한 뒤, 일기 속 말을 짚고, 이 기분을 지키는 작은 행동 하나. 예: 창밖을 1분 바라보기, 숨 세 번 천천히, 어깨 한번 내리기. 감정 이름을 바꾸지 마세요.",
    en: "Empathize with feeling good, then one tiny way to keep it: look out a window for a minute, take three slow breaths, or drop the shoulders once.",
  },
  calm: {
    ko: "편안함에 공감한 뒤, 일기 속 말을 짚고, 서두르지 않고 간직할 작은 행동 하나. 예: 기대하는 일 한 줄 적기, 지금 풍경 한 장, 심호흡 한 번. 감정 이름을 바꾸지 마세요.",
    en: "Empathize with the calm, then one tiny way to hold it without rushing: write one hope, take one photo of now, or take a single deep breath.",
  },
  neutral: {
    ko: "보통인 하루에 공감한 뒤, 일기 속 말을 짚고, 몸을 땅에 붙이는 작은 행동 하나. 예: 발바닥 감각 느끼기, 보이는 물건 세 개 말하기, 넷까지 세며 숨 쉬기. 더 특별해야 한다는 말·감정 이름 바꾸기는 금지.",
    en: "Empathize with an ordinary day without saying it should feel bigger. Then one grounding action: feel both feet on the floor, name three things you see, or breathe in for a count of four.",
  },
  worried: {
    ko: "걱정을 지우지 말고 공감한 뒤, 일기 속 말을 짚고, 조금 덜어 줄 작은 행동 하나. 예: 창문 열고 바람, 따뜻한 물 한 모금, 잔잔한 노래 한 곡. '걱정 마'·감정 이름 바꾸기는 금지.",
    en: "Empathize with the worry without saying 'don't worry'. Then one tiny action that can soften it: open a window, sip warm water, or play one gentle song.",
  },
  sad: {
    ko: "슬픔을 지우거나 기운 내라는 말 없이 공감한 뒤, 일기 속 말을 짚고, 조금 덜어 줄 작은 행동 하나. 예: 창문 열고 바람, 따뜻한 물 한 모금, 1분 스트레칭. '힘내'·감정 이름 바꾸기는 금지.",
    en: "Empathize with sadness without cheering them up. Then one tiny action that can soften it: open a window, sip warm water, or stretch for a minute. Not 'cheer up'.",
  },
  angry: {
    ko: "화남을 잘못이라고 하지 말고 공감한 뒤, 일기 속 말을 짚고, 열을 조금 빼는 작은 행동 하나. 예: 어깨 털기, 찬물로 손 씻기, 자리에서 일어나 한 바퀴. 훈계·감정 이름 바꾸기는 금지.",
    en: "Empathize with the anger without scolding. Then one tiny way to let heat out: shake out the shoulders, rinse hands with cool water, or stand and walk once around the room.",
  },
  "very-bad": {
    ko: "매우 나쁨을 게으름으로 보지 말고 공감한 뒤, 일기 속 말을 짚고, 거의 힘 안 드는 행동 하나. 예: 물 한 모금, 커튼 열기, 자리에서 한번 일어나기. 큰 계획·잔소리·감정 이름 바꾸기는 금지.",
    en: "Empathize with feeling very bad without calling it laziness. Then one almost-effortless action: sip water, open the curtains, or stand up once. No big plans.",
  },
};

export async function generateCopy(input: AiCopyRequest): Promise<AiCopyResponse> {
  if (!anthropicKey()) throw new Error("missing_key");

  if (input.kind === "home-tip") {
    const { text } = await generateText({
      model: MODEL,
      prompt:
        input.locale === "en"
          ? `Write one short, warm line encouraging someone to jot a feeling in a mood journal. Tone like: "Writing a feeling can make the heart lighter." One sentence. No quotes, no emoji, no name. Max 70 characters.`
          : `감정 일기 작성 화면에 넣을 짧은 응원 한 줄을 만드세요. 톤은 "감정을 기록하면 마음이 가벼워져요."처럼 다정하고 담백하게. 한 문장만. 따옴표·이모지·이름 없이. 40자 이내.`,
    });
    const line = stripWrap(text);
    if (!line) throw new Error("empty");
    return { kind: "home-tip", text: line };
  }

  const emotion = input.emotion;
  const actionGuide = ACTION_GUIDES[emotion];
  if (!actionGuide) throw new Error("bad_emotion");

  const locale = input.locale;
  const emotionWord = EMOTION_LABELS[locale][emotion];
  const diary = input.text.trim();
  const nickname = input.nickname?.trim();

  const { text } = await generateText({
    model: MODEL,
    prompt: [
      locale === "en"
        ? "You write a brief mood-journal reflection. JSON only, no markdown."
        : "감정 일기 공감 문구를 만듭니다. JSON만 출력하고 마크다운은 쓰지 마세요.",
      locale === "en"
        ? `The emotion face they tapped (do not replace this with a different emotion): ${emotionWord}`
        : `사용자가 고른 감정 얼굴(다른 감정으로 바꾸지 마세요): ${emotionWord}`,
      locale === "en"
        ? `Diary they wrote (you must use this; mention a word or situation from it at least once):\n${diary || "(empty)"}`
        : `사용자가 적은 기록(반드시 이 내용을 쓰세요. 단어나 상황을 한 번은 짚으세요):\n${diary || "(비어 있음)"}`,
      nickname ? `nickname: ${nickname}` : "nickname: (none)",
      actionGuide[locale],
      locale === "en"
        ? `aiLabel must be one adjective + the exact selected emotion "${emotionWord}". Never use another emotion name.`
        : `aiLabel은 수식어 하나 + 고른 감정 이름 '${emotionWord}' 그대로. 다른 감정 이름은 쓰지 마세요.`,
      locale === "en"
        ? "aiMessage: 2-4 short sentences. First empathize with BOTH the selected emotion and THIS diary. Then one simple action that fits that emotion. Do not invent facts. You may use the nickname once if present."
        : "aiMessage는 2-4문장. 고른 감정과 이 일기 내용 둘 다에 공감한 다음, 그 감정에 맞는 작은 행동 하나. 없는 사실을 만들지 마세요. 닉네임이 있으면 한 번만 불러도 됩니다.",
      `Return {"aiLabel":"...","aiPercent":82,"aiMessage":"..."}.`,
      "aiPercent must be an integer from 70 to 88.",
    ].join("\n"),
  });
  const parsed = parseDetail(text);
  return { kind: "detail", ...finishDetailAi(emotion, diary, locale, parsed) };
}

type NodeRes = {
  status: (code: number) => NodeRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

export default async function handler(
  req: { method?: string; body?: AiCopyRequest },
  res: NodeRes,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  try {
    const result = await generateCopy(req.body as AiCopyRequest);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: "ai_failed" });
  }
}
