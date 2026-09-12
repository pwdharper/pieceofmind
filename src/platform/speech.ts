type SpeechHandlers = {
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
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

export function isSpeechSupported(): boolean {
  return Boolean(RecognitionCtor());
}

export function createSpeechSession(handlers: SpeechHandlers) {
  const Ctor = RecognitionCtor();
  if (!Ctor) {
    handlers.onError("이 브라우저에서는 음성 기록을 지원하지 않아요.");
    return { start() {}, stop() {} };
  }

  const recognition = new Ctor();
  recognition.lang = "ko-KR";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const piece = event.results[0]?.[0]?.transcript?.trim();
    if (piece) handlers.onTranscript(piece);
  };
  recognition.onerror = (event) => {
    if (event.error === "not-allowed") {
      handlers.onError("마이크 권한이 필요해요.");
      return;
    }
    if (event.error === "no-speech") {
      handlers.onError("음성이 들리지 않았어요.");
      return;
    }
    handlers.onError("음성을 글자로 바꾸지 못했어요.");
  };
  recognition.onend = () => handlers.onEnd();

  return {
    start() {
      recognition.start();
    },
    stop() {
      recognition.stop();
    },
  };
}

export function appendTranscript(current: string, spoken: string, max: number): string {
  const joined = current.trim() ? `${current.trim()} ${spoken}` : spoken;
  return joined.slice(0, max);
}
