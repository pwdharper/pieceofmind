import "./chrome.css";

export function AppButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="save-btn" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
