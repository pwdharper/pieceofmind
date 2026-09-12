import { cakeImages } from "../assets/cakes";
import { getPrefs } from "../platform/prefs";

export function ThemeCakeIcon({ size = 32 }: { size?: number }) {
  const src = cakeImages[getPrefs().themeId];
  return <img src={src} alt="" width={size} height={size} />;
}
