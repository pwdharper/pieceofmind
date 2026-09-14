# Piece of Mind

하루에 감정 한 조각을 남기는 모바일 웹 일기장입니다.
지금은 이 브라우저의 localStorage에 저장됩니다. 설정 로그인은 이 기기 세션만 기억하고, 계정 저장(Supabase)과 기록 상세 Claude 분석은 아래 목표 스택입니다.

모바일 브라우저와 데스크톱 브라우저에서 모두 동작합니다.
화면은 Figma 모바일 프레임(402px)이 기준이며, 데스크톱에서는 가운데 폰 캔버스로 보입니다.
이후 같은 웹 빌드를 Capacitor 등으로 감싸 앱스토어에 올릴 수 있습니다.

## 지금 되는 것

- 홈: 날짜, 감정 2×4(라벨 없음), 일기(200자), 사진, 음성(Web Speech, 언어 설정에 따라 `ko-KR`/`en-US` → 입력란), 저장. 아직 없는 날을 처음 쓸 때만 랜덤 안내 한 줄(한/영 풀). 안내 아이콘은 설정에서 고른 케이크
- 기록 상세: 그날의 감정 얼굴, 글, 사진, 로컬 폴백 AI. 라벨은 `'{이름}' {n}% 포착` (앞에 `AI 분석 :` 없음). 아이콘은 고른 케이크. 홈에서 보면 수정만, 통계에서 보면 뒤로/수정/닫기
- 기록 수정: 같은 날 감정·글·사진을 고침. 저장하면 기록 상세로 가고, AI는 그때의 감정·글로 다시 붙임
- 통계: 달력(기록 있는 날에 감정 얼굴), 감정 분석(원형 그래프, 기간 이번주/이번달/올해). 한/영은 설정 언어(달력·감정 분석·기록·빈 상태 문구). 화면 이미지 저장. 없는 날을 누르면 그 날짜 작성 화면(홈과 같은 안내 한 줄)
- 설정: 이메일 로그인(이 기기 세션만), 구글/카카오는 “곧 연결할게요.”, 테마(생크림/치즈), 언어(설정에서 고르면 홈·통계·설정도 한/영). 이메일·비밀번호는 한 줄 입력, 비밀번호는 기본 마스킹이고 눈 아이콘으로 보기/숨기기. 로그인되면 닉네임(있을 때)과 이메일을 보여 줌
- 회원가입(`/signup`): Figma 회원가입 화면. 인트로(함께 기분을 맞춰볼까요?)는 가운데 정렬. 이메일·비밀번호 필수, 닉네임 선택. 하단 탭·테마·언어 없음. 가입 후 설정으로 감. 이미 로그인돼 있으면 설정으로 보냄

감정: 행복, 평온, 설렘, 불안, 슬픔, 화남, 피곤, 무기력

테마: 생크림, 치즈. 없는 테마 값이 있으면 생크림으로 돌아감

## 페이지 이동

하루에 기록은 날짜당 1개입니다. 로그인 여부는 주소를 바꾸지 않습니다.

| 주소 | 화면 | 하단 탭 |
| --- | --- | --- |
| `/` | 홈. 오늘 기록이 없으면 작성, 있으면 그날 상세 | 있음 |
| `/?date=YYYY-MM-DD` | 그 날짜 작성. 이미 있으면 그날 상세 | 있음 |
| `/insights` | 통계 | 있음 |
| `/settings` | 설정 | 있음 |
| `/signup` | 이메일 회원가입 | 없음 |
| `/entries/:id` | 기록 상세 | 있음 |
| `/entries/:id/edit` | 기록 수정 | 없음 |

- 탭: 홈 ↔ 통계 ↔ 설정. 기록 상세에서는 들어온 곳(홈/통계) 탭이 켜짐
- 홈에서 저장하면 기록 상세. 수정에서 저장해도 기록 상세(통계에서 고친 뒤에도 통계로 바로 돌아가지 않음)
- 이미 저장된 날의 홈/하단 홈 탭도 기록 상세
- 통계 달력에서 기록이 있는 날 → 기록 상세. 없는 날 → 그 날짜 작성 화면
- 수정은 기록 상세의 수정으로만 들어갑니다. 하단 탭은 수정 화면과 회원가입에서 숨깁니다
- 기록 상세 홈에서 봄: 뒤로 없음, 닫기 없음, 수정만. 통계에서 봄: 뒤로·닫기·수정
- 설정에서 회원가입 → `/signup`. 뒤로와 로그인은 설정. 가입 성공·이미 로그인된 `/signup`도 설정
- 설정 로그인/회원가입은 이 기기 `pom.session`만 바꿈(이메일, 선택 닉네임). 게스트 기록 합치기는 아직 없음
- 없는 주소나 없는 기록 id → `/`

흐름은 `src/app/App.tsx`와 각 화면의 `navigate(...)`를 보면 됩니다. 들어온 곳은 `src/lib/navFrom.ts`의 `from: "home" | "insights"`입니다.

## 기술 스택

| 구분 | 선택 | 이유 |
| --- | --- | --- |
| 프론트 | Vite + React + TypeScript + React Router | 모바일 웹 SPA. 나중에 같은 `dist`를 앱으로 감쌈 |
| 스타일 | CSS 변수 + PhoneShell(402px) | 케이크 테마 전환, 데스크톱에서도 동일 화면. 스크롤은 바깥 프레임, 바 유무로 캔버스 폭이 안 변함 |
| 호스팅 | Vercel (수동) | Git 자동 배포 없음. 배포 요청이 있을 때만 `npx vercel` |
| 계정/기록 | Supabase Auth + Postgres + Storage | 로컬 개발 가능, 이후 다른 백엔드로 갈아타기 쉬움 |
| 비로그인 기록 | localStorage | 가입 없이 바로 사용 |
| 홈 하단 안내 | 로컬 문구 풀 랜덤 | 그 날짜를 처음 쓸 때만. Claude 아님 |
| 기록 상세 AI | 지금은 로컬 폴백. 목표는 Claude (`ai` + `@ai-sdk/anthropic`) | 첫 저장과 수정 저장마다 다시. 키는 서버만 |
| 앱 (이후) | Capacitor 또는 PWA | 웹 화면을 그대로 래핑. Expo로 다시 그리지 않음 |

화면 코드는 벤더 SDK를 직접 부르지 않습니다.
`AuthPort`, `EntryRepository`, `FileStore`, `AiCopyPort`만 사용해서 나중에 저장소나 모델을 바꿀 수 있습니다.

## 기록은 어디에 저장되나요?

지금은 이 브라우저의 localStorage입니다.

- 기록: `pom.entries`
- 테마/언어: `pom.prefs`
- 설정 로그인 세션: `pom.session` (이메일, 선택 닉네임. 서버 인증 아님)

목표 저장소는 아래와 같습니다.

- 로그아웃: 이 브라우저의 localStorage
- 로그인/회원가입: Supabase (`entries` 테이블, 본인 행만 RLS)
- 로그인하는 순간: 기기에 있던 게스트 기록을 계정으로 합친 뒤 로컬 게스트 버킷을 비움

1차는 이메일 가입/로그인입니다. 구글·카카오 버튼은 화면에 두고 제공자 연동은 이후입니다.

## AI 문구

지금은 Claude를 부르지 않고 로컬 문구를 씁니다.

1. **홈 하단 안내** ([45:68](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-68), Home `45:555` 안) — 그 날짜 기록이 아직 없을 때, 작성 화면에만. 오늘(`/`)이든 통계에서 빈 날을 눌러 연 `/?date=`든 같습니다. `src/content/homeTips.ts` 문구 풀에서 랜덤 1개. 아이콘은 `ThemeCakeIcon`(설정 케이크). 저장하면 기록 상세로 가서 이 줄은 숨김. 예: `감정을 기록하면 마음이 가벼워져요.` Claude를 부르지 않습니다.
2. **기록 상세 분석** ([56:28](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=56-28)) — `'{보람찬 행복}' 82% 포착` + 공감 말풍선. 아이콘은 같은 케이크. `src/content/detailAi.ts` 폴백을 `upsertEntry`가 붙입니다. 감정으로 이름·말풍선을 고르고, 글 해시로 포착 %(70–88)를 정합니다. 첫 저장과 수정 저장마다 다시 계산해서, 고친 데이터 기준 피드백이 상세에 보입니다.

이후에는 Claude가 기록 상세 문구를 만듭니다. `ANTHROPIC_API_KEY`는 서버 환경 변수만 쓰고, 프론트(`VITE_`)에는 넣지 않습니다.
로컬에서는 `/api/ai-copy`로 호출합니다. 키가 없거나 호출이 실패하면 Figma 톤의 짧은 폴백 문구를 보여 칸이 비지 않게 합니다.

## 감정 아이콘

Figma 얼굴을 `src/assets/emotions/*.svg`로 두고 `EmotionIcon`이 `<img>`로 그립니다. 기본 잎은 64px(`--emotion-size`). 고르면 그 감정 색 원이 뒤에 깔립니다. 얼굴은 64 박스 안 가운데(~55px)에 맞춰 두었습니다.

| 쓰는 곳 | 크기 |
| --- | --- |
| 홈·수정 그리드 | 64px |
| 기록 상세 | 72px |
| 통계 달력 | 16px |

불안·무기력은 아래 노드의 새 얼굴입니다. 나머지 여섯은 그리드 `45:23`에서 받은 파일입니다.

## 로컬에서 실행

필요: Node.js 20+, (로그인/계정 저장을 쓰려면) Supabase 프로젝트 또는 로컬 Supabase, (AI 문구를 쓰려면) Anthropic API 키

```bash
npm install
cp .env.example .env
npm run dev
```

브라우저에서 `http://localhost:5173` 또는 `http://127.0.0.1:5173`을 엽니다.
홈·통계·설정 1차는 환경 변수 없이 localStorage만으로 동작합니다.

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

## 어디를 고치면 되나요

화면 파일에 색 코드나 절대 위치를 넣지 않습니다. 바꾸고 싶은 것만 아래 파일을 엽니다.

| 바꾸고 싶은 것 | 여는 파일 |
| --- | --- |
| 전체 배경, 포인트색, 글자색 | `src/theme/tokens.css` |
| 케이크 2색 (생크림, 치즈) | `src/theme/cakes.ts` |
| 여백, 모서리, 버튼 높이 | `src/theme/tokens.css` (`--space-*`, `--radius-*`, `--tap`) |
| 감정 칸 기본 크기 | `src/theme/tokens.css` (`--emotion-size`) |
| 감정 칸 열 수 | `src/components/EmotionGrid` |
| 하단 탭 | `src/components/BottomNav` |
| 저장 버튼 모양 | `src/components/AppButton` |
| 홈 블록 순서 | `src/screens/Home`에서 컴포넌트 줄 순서 |
| 페이지 이동 | `src/app/App.tsx`, 각 화면의 `navigate(...)`, `src/lib/navFrom.ts` |
| 감정 그림 | `src/assets/emotions` 파일만 교체 |
| 케이크 그림 | `src/assets/cakes` 파일만 교체 |
| 홈 안내·상세 AI의 케이크 아이콘 | `src/components/ThemeCakeIcon.tsx` |
| 설정 화면 한/영 문구 | `src/screens/Settings.tsx`의 `COPY` |
| 회원가입 화면 한/영 문구 | `src/screens/Signup.tsx`의 `COPY` |
| 홈·통계 한/영 문구(달력, 감정 분석, 기간, 기록) | `src/content/uiCopy.ts` |
| 케이크 카드 이름 | `src/theme/cakes.ts`의 `labelKo` / `labelEn` |
| 비밀번호 눈 아이콘 | `src/assets/icons` |
| 홈 AI 팁 문구 풀 | `src/content/homeTips.ts` |
| 기록 상세 AI 폴백 | `src/content/detailAi.ts` |
| 저장 시 AI를 다시 붙이는 곳 | `src/platform/localEntries.ts`의 `upsertEntry` |

## 폴더

- `src/shell` — 402px PhoneShell
- `src/screens` — Home, Insights, Settings, Signup, 기록 상세/수정
- `src/components` — 하단 탭, 감정 그리드, 작성 폼, `ThemeCakeIcon`
- `src/theme` — 색/간격/라운드/글자 + 케이크 2종
- `src/domain` — Emotion, Entry, ThemeId, Locale
- `src/platform` — Auth/Entry/File/AI 포트. 지금은 게스트=localStorage, 이후 로그인=supabase
- `src/content` — 홈 팁, 한/영 UI 문구, 상세 AI 폴백
- `src/hooks` — `useLocale`, 작성 폼
- `src/lib` — 날짜, 통계, `navFrom`
- `api` — `/api/ai-copy` (Claude, 서버 전용)
- `src/assets/emotions` — 감정 8종 SVG
- `src/assets/cakes` — 생크림, 치즈 (Figma 설정 화면과 같은 그림)
- `src/assets/icons` — 비밀번호 보기/숨기기 눈

## 디자인

Figma는 구현의 출발점입니다. 설정 테마 카드는 [Setting (Logged Out)](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-561)의 케이크 2종을 씁니다.

- 화면/IA: [ver.3](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-554)
- 설정: [Setting (Logged Out)](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-561)
- 회원가입: [Setting (Signup)](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=187-4) 인트로 두 줄은 가운데 정렬
- 케이크 테마 색: [Cake Themes](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=19-63)
- 홈 감정 그리드: [45:23](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-23)
- 불안 얼굴: [45:38](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-38)
- 무기력 얼굴: [45:55](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-55)
- 홈 AI 한 줄: [ai-feedback-row](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=45-68)
- 기록 상세 AI 분석: [ai-section](https://www.figma.com/design/fXf0CZ7VxsYwStByYCuzRA?node-id=56-28)

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
