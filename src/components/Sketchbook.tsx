import { MAX_TEXT } from "../domain/types";
import "./chrome.css";

export function Sketchbook({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="sketchbook">
      <textarea
        value={value}
        maxLength={MAX_TEXT}
        placeholder={"오늘 하루를 자유롭게 적어보세요.\n마음의 조각을 남겨봐요."}
        onChange={(event) => onChange(event.target.value.slice(0, MAX_TEXT))}
      />
      <span className="sketchbook-count">
        {value.length}/{MAX_TEXT}자
      </span>
    </label>
  );
}
