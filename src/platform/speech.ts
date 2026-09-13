import { getPrefs } from "./prefs";
import type { SpeechErrorId } from "../content/uiCopy";

type SpeechHandlers = {
  onTranscript: (spoken: string) => void;
  onHold?: () => void;
  onError: (id: SpeechErrorId) => void;
  onEnd: () => void;
};

type SpeechResult = {
  isFinal: boolean;
  0?: { transcript?: string };
  item?: (index: number) => { transcript?: string } | undefined;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

function RecognitionCtor() {
  const w = window as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function resultText(result: SpeechResult): string {
  return (result[0] ?? result.item?.(0))?.transcript?.trim() ?? "";
}

function sessionSpoken(results: ArrayLike<SpeechResult>): string {
  const parts: string[] = [];
  for (let i = 0; i < results.length; i += 1) {
    const piece = resultText(results[i]);
    if (piece) parts.push(piece);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function isSpeechSupported(): boolean {
  return Boolean(RecognitionCtor());
}

export function createSpeechSession(handlers: SpeechHandlers) {
  const Ctor = RecognitionCtor();
  if (!Ctor) {
    return {
      start() {
        handlers.onError("unsupported");
        handlers.onEnd();
      },
      stop() {},
    };
  }

  const recognition = new Ctor();
  recognition.lang = getPrefs().locale === "en" ? "en-US" : "ko-KR";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  let active = false;

  recognition.onresult = (event) => {
    const spoken = sessionSpoken(event.results);
    if (spoken) handlers.onTranscript(spoken);
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted" || event.error === "no-speech") return;
    active = false;
    if (event.error === "not-allowed") {
      handlers.onError("notAllowed");
      return;
    }
    if (event.error === "network") {
      handlers.onError("network");
      return;
    }
    handlers.onError("failed");
  };

  recognition.onend = () => {
    if (!active) {
      handlers.onEnd();
      return;
    }
    handlers.onHold?.();
    try {
      recognition.start();
    } catch {
      active = false;
      handlers.onEnd();
    }
  };

  return {
    start() {
      active = true;
      try {
        recognition.start();
      } catch (error) {
        active = false;
        const name = error instanceof DOMException ? error.name : "";
        if (name === "NotAllowedError" || name === "NotFoundError") {
          handlers.onError("notAllowed");
        } else {
          handlers.onError("failed");
        }
        handlers.onEnd();
      }
    },
    stop() {
      active = false;
      try {
        recognition.stop();
      } catch {
        handlers.onEnd();
      }
    },
  };
}

export function appendTranscript(current: string, spoken: string, max: number): string {
  const joined = current.trim() ? `${current.trim()} ${spoken}` : spoken;
  return joined.slice(0, max);
}
