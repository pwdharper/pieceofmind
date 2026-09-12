export const HOME_TIPS = [
  "감정을 기록하면 마음이 가벼워져요.",
  "오늘 한 조각이면 충분해요.",
  "완벽한 문장보다 솔직한 한 줄이 좋아요.",
  "기분을 이름 붙이면 조금 멀어져요.",
  "잠깐 멈춰 자신을 바라보는 시간이에요.",
  "작은 기록도 내일의 내가 고마워해요.",
];

export function pickHomeTip(): string {
  return HOME_TIPS[Math.floor(Math.random() * HOME_TIPS.length)];
}
