import "./chrome.css";

export function PhotoPreview({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="photo-preview-wrap">
      <img className="photo-preview" src={src} alt="붙인 사진" />
      <button type="button" className="photo-remove" onClick={onRemove} aria-label="사진 삭제">
        <CloseIcon />
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
