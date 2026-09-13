import { type ReactNode } from "react";
import { UI } from "../content/uiCopy";
import { useLocale } from "../hooks/useLocale";
import type { useEntryComposer } from "../hooks/useEntryComposer";
import { EmotionGrid } from "./EmotionGrid";
import { Greeting } from "./Greeting";
import { MediaRow } from "./MediaRow";
import { PhotoPreview } from "./PhotoPreview";
import { Sketchbook } from "./Sketchbook";

type Composer = ReturnType<typeof useEntryComposer>;

export function EntryForm({
  dateLabel,
  composer,
  footer,
}: {
  dateLabel: string;
  composer: Composer;
  footer?: ReactNode;
}) {
  const t = UI[useLocale()];
  return (
    <main className="home-main">
      <Greeting dateLabel={dateLabel} title={t.home.greeting} />
      <EmotionGrid value={composer.emotion} onChange={composer.setEmotion} />
      <Sketchbook value={composer.text} onChange={composer.setText} />
      <MediaRow
        listening={composer.listening}
        speechError={composer.speechError}
        onPhoto={composer.handlePhoto}
        onVoice={composer.handleVoice}
      />
      {composer.photoUrl ? (
        <PhotoPreview src={composer.photoUrl} onRemove={() => composer.setPhotoUrl(undefined)} />
      ) : null}
      {footer}
    </main>
  );
}
