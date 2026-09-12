import tipFace from "../assets/emotions/행복.svg";
import "./chrome.css";

export function AiTip({ text }: { text: string }) {
  return (
    <p className="ai-tip">
      <span className="ai-tip-face" aria-hidden>
        <img src={tipFace} alt="" width={18} height={18} />
      </span>
      {text}
    </p>
  );
}
