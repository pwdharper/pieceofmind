import type { Emotion } from "../../domain/types";
import veryGood from "./emotion_01_very-good.svg";
import good from "./emotion_02_good.svg";
import calm from "./emotion_03_calm.svg";
import neutral from "./emotion_04_neutral.svg";
import worried from "./emotion_05_worried.svg";
import sad from "./emotion_06_sad.svg";
import angry from "./emotion_07_angry.svg";
import veryBad from "./emotion_08_very-bad.svg";

export const emotionImages: Record<Emotion, string> = {
  "very-good": veryGood,
  good,
  calm,
  neutral,
  worried,
  sad,
  angry,
  "very-bad": veryBad,
};
