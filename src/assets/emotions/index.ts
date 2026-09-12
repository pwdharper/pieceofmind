import type { Emotion } from "../../domain/types";
import happy from "./행복.svg";
import calm from "./평온.svg";
import flutter from "./설렘.svg";
import anxious from "./불안.svg";
import sad from "./슬픔.svg";
import angry from "./화남.svg";
import tired from "./피곤.svg";
import drained from "./무기력.svg";

export const emotionImages: Record<Emotion, string> = {
  행복: happy,
  평온: calm,
  설렘: flutter,
  불안: anxious,
  슬픔: sad,
  화남: angry,
  피곤: tired,
  무기력: drained,
};
