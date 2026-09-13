import { UI } from "../content/uiCopy";
import { MAX_TEXT } from "../domain/types";
import { useLocale } from "../hooks/useLocale";
import "./chrome.css";

export function Sketchbook({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const t = UI[useLocale()].home;
  return (
    <label className="sketchbook">
      <textarea
        value={value}
        maxLength={MAX_TEXT}
        placeholder={t.placeholder}
        onChange={(event) => onChange(event.target.value.slice(0, MAX_TEXT))}
      />
      <span className="sketchbook-count">
        {value.length}/{MAX_TEXT}
        {t.chars}
      </span>
    </label>
  );
}
