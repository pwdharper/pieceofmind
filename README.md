# Piece of Mind

하루에 감정 한 조각을 남기는 모바일 웹 일기장입니다.
로그인하지 않아도 기록을 저장할 수 있고, 회원가입/로그인 후에는 같은 기록이 계정에 저장됩니다.

모바일 브라우저와 데스크톱 브라우저에서 모두 동작합니다.
화면은 Figma 모바일 프레임(402px)이 기준이며, 데스크톱에서는 가운데 폰 캔버스로 보입니다.
이후 같은 웹 빌드를 Capacitor 등으로 감싸 앱스토어에 올릴 수 있습니다.

## 화면

- 홈: 오늘 감정, 일기, 사진/음성, 저장, AI 한 줄 팁
- 기록 상세: 그날의 조각과 AI 분석(라벨·%, 말풍선)
- 기록 수정
- 통계: 달력, Flow, Mood Breakdown
- 설정: 로그인/회원가입, 테마(케이크 6종), 언어(한/영)

감정: 행복, 평온, 설렘, 불안, 슬픔, 화남, 피곤, 무기력

테마: 생크림, 치즈, 딸기, 말차, 블루베리, 초코

## 디자인

- 화면/IA: [ver.3](https://figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-554)
- 케이크 테마 색: [Cake Themes](https://figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=19-63)
- 홈 AI 한 줄: [ai-feedback-row](https://figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-68)
- 기록 상세 AI 분석: [ai-section](https://figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=56-28)

## 기술 스택

| 구분 | 선택 | 이유 |
| --- | --- | --- |
| 프론트 | Vite + React + TypeScript + React Router | 모바일 웹 SPA. 나중에 같은 `dist`를 앱으로 감쌈 |
| 스타일 | CSS 변수 + PhoneShell(402px) | 케이크 테마 전환, 데스크톱에서도 동일 화면 |
| 호스팅 | Vercel (수동) | Git 자동 배포 없음. 배포 요청이 있을 때만 `npx vercel` |
| 계정/기록 | Supabase Auth + Postgres + Storage | 로컬 개발 가능, 이후 다른 백엔드로 갈아타기 쉬움 |
| 비로그인 기록 | localStorage | 가입 없이 바로 사용 |
| AI 문구 | Claude API (`ai` + `@ai-sdk/anthropic`) | 홈 한 줄 + 기록 상세 분석. 키는 서버만 |
| 앱 (이후) | Capacitor 또는 PWA | 웹 화면을 그대로 래핑. Expo로 다시 그리지 않음 |

화면 코드는 벤더 SDK를 직접 부르지 않습니다.
`AuthPort`, `EntryRepository`, `FileStore`, `AiCopyPort`만 사용해서 나중에 저장소나 모델을 바꿀 수 있습니다.

## 기록은 어디에 저장되나요?

- 로그아웃: 이 브라우저의 localStorage
- 로그인/회원가입: Supabase (`entries` 테이블, 본인 행만 RLS)
- 로그인하는 순간: 기기에 있던 게스트 기록을 계정으로 합친 뒤 로컬 게스트 버킷을 비움

1차는 이메일 가입/로그인입니다. 구글·카카오 버튼은 화면에 두고 제공자 연동은 이후입니다.

## AI 문구

Claude가 두 칸의 문구를 만듭니다. `ANTHROPIC_API_KEY`는 서버 환경 변수만 쓰고, 프론트(`VITE_`)에는 넣지 않습니다.
로컬에서는 `/api/ai-copy`로 호출합니다. 키가 없거나 호출이 실패하면 Figma 톤의 짧은 폴백 문구를 보여 칸이 비지 않게 합니다.

1. **홈 한 줄** — 저장 버튼 아래. 예: `감정을 기록하면 마음이 가벼워져요.` 감정 선택 또는 저장 직후에 갱신합니다.
2. **기록 상세 분석** — 헤더 예: `AI 분석: '보람찬 행복' 82% 포착` + 공감 말풍선. 저장할 때 한 번 만들어 기록에 붙여 두고, 다시 열 때는 재생성하지 않습니다.

## 로컬에서 실행

필요: Node.js 20+, (로그인/계정 저장을 쓰려면) Supabase 프로젝트 또는 로컬 Supabase, (AI 문구를 쓰려면) Anthropic API 키

```bash
npm install
cp .env.example .env
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다.

계정 기능을 쓰려면:

```bash
npx supabase start
npx supabase db reset
```

## 환경 변수

`.env.example`을 복사해 값을 넣습니다. 시크릿은 커밋하지 않습니다.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

프론트에는 Supabase publishable/anon 키만 넣습니다. `service_role`과 Claude 키는 넣지 않습니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — `dist` 생성
- `npm run preview` — 빌드 미리보기

## 폴더

- `src/shell` — 402px PhoneShell
- `src/screens` — Home, Insights, Settings, 기록 상세/수정
- `src/components` — 하단 탭, 감정 그리드, 케이크 피커
- `src/theme` — 케이크 6종 CSS 변수
- `src/domain` — Emotion, Entry, ThemeId, Locale
- `src/platform` — Auth/Entry/File/AI 포트. 게스트=local, 로그인=supabase
- `api` — `/api/ai-copy` (Claude, 서버 전용)
- `src/assets` — Figma에서 받은 아이콘·케이크·얼굴

## 배포 (Vercel, 수동만)

기본은 로컬입니다. `npm run dev`로 구현하고 확인합니다.
Git을 Vercel에 연결하지 않습니다. 푸시로 프리뷰/프로덕션이 자동 배포되지 않게 합니다.

배포는 별도로 요청할 때만 합니다.

```bash
npx vercel        # 미리보기 (요청 시에만)
npx vercel --prod # 프로덕션 (요청 시에만)
```

그때 쓰는 설정:

- 프레임워크 프리셋 Vite, 출력 `dist`
- `vercel.json` rewrite: `/(.*)` → `/index.html`
- 환경 변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`(서버 전용)
- Supabase Redirect URL에 그때 받은 Vercel 도메인을 추가

## 이후

- 구글/카카오 로그인
- 사진·음성 업로드 (Storage)
- Capacitor로 iOS/Android 래핑
