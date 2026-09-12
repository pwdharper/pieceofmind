import { type ReactNode } from "react";
import { EmotionGrid } from "./EmotionGrid";
import { Greeting } from "./Greeting";
import { MediaRow } from "./MediaRow";
import { PhotoPreview } from "./PhotoPreview";
import { Sketchbook } from "./Sketchbook";
import type { useEntryComposer } from "../hooks/useEntryComposer";

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
  return (
    <main className="home-main">
      <Greeting dateLabel={dateLabel} />
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
