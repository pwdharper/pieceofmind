import "./chrome.css";

export function Greeting({ dateLabel }: { dateLabel: string }) {
  return (
    <section className="greeting">
      <p className="greeting-date">{dateLabel}</p>
      <h2 className="greeting-title">오늘 기분은 어때요?</h2>
    </section>
  );
}
