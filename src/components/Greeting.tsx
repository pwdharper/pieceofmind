import "./chrome.css";

export function Greeting({ dateLabel, title }: { dateLabel: string; title: string }) {
  return (
    <section className="greeting">
      <p className="greeting-date">{dateLabel}</p>
      <h2 className="greeting-title">{title}</h2>
    </section>
  );
}
