import { useEffect, useRef, useState } from "react";
import { MAX_TEXT, type Emotion } from "../domain/types";
import { appendTranscript, createSpeechSession, isSpeechSupported } from "../platform/speech";

export function useEntryComposer(initial?: {
  emotion?: Emotion | null;
  text?: string;
  photoUrl?: string;
}) {
  const [emotion, setEmotion] = useState<Emotion | null>(initial?.emotion ?? null);
  const [text, setText] = useState(initial?.text ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initial?.photoUrl);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const speechRef = useRef<ReturnType<typeof createSpeechSession> | null>(null);
  const textRef = useRef(text);
  const textBaseRef = useRef(initial?.text ?? "");
  textRef.current = text;

  useEffect(() => {
    return () => speechRef.current?.stop();
  }, []);

  function handlePhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleVoice() {
    setSpeechError(null);
    if (!isSpeechSupported()) {
      setSpeechError("이 브라우저에서는 음성 기록을 지원하지 않아요. Chrome에서 열어 주세요.");
      return;
    }
    if (listening) {
      speechRef.current?.stop();
      setListening(false);
      return;
    }
    textBaseRef.current = textRef.current;
    speechRef.current = createSpeechSession({
      onTranscript: (spoken) => {
        setText(appendTranscript(textBaseRef.current, spoken, MAX_TEXT));
      },
      onHold: () => {
        textBaseRef.current = textRef.current;
      },
      onError: (message) => {
        setSpeechError(message);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    setListening(true);
    speechRef.current.start();
  }

  return {
    emotion,
    setEmotion,
    text,
    setText,
    photoUrl,
    setPhotoUrl,
    listening,
    speechError,
    canSave: Boolean(emotion && text.trim()),
    handlePhoto,
    handleVoice,
  };
}
