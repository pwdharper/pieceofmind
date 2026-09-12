import { ThemeCakeIcon } from "./ThemeCakeIcon";
import "./chrome.css";

export function AiTip({ text }: { text: string }) {
  return (
    <p className="ai-tip">
      <span className="ai-tip-face" aria-hidden>
        <ThemeCakeIcon size={32} />
      </span>
      {text}
    </p>
  );
}
