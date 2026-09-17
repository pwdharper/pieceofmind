import { fallbackDetailAi, finishDetailAi } from "../content/detailAi";
import { pickHomeTip } from "../content/homeTips";
import type { Emotion, Locale } from "../domain/types";

type DetailAi = ReturnType<typeof fallbackDetailAi>;

async function postAiCopy(body: unknown) {
  const response = await fetch("/api/ai-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("ai_failed");
  return response.json() as Promise<Record<string, unknown>>;
}

export async function requestHomeTip(locale: Locale): Promise<string> {
  try {
    const data = await postAiCopy({ kind: "home-tip", locale });
    const text = String(data.text ?? "").trim();
    return text || pickHomeTip(locale);
  } catch {
    return pickHomeTip(locale);
  }
}

export async function requestDetailAi(
  locale: Locale,
  emotion: Emotion,
  text: string,
  nickname?: string,
): Promise<DetailAi> {
  try {
    const data = await postAiCopy({ kind: "detail", locale, emotion, text, nickname });
    const aiLabel = String(data.aiLabel ?? "").trim();
    const aiMessage = String(data.aiMessage ?? "").trim();
    const percent = Number(data.aiPercent);
    if (!aiLabel || !aiMessage) throw new Error("bad_payload");
    return finishDetailAi(emotion, text, locale, {
      aiLabel,
      aiPercent: Number.isFinite(percent) ? percent : 80,
      aiMessage,
    });
  } catch {
    return fallbackDetailAi(emotion, text, locale);
  }
}
