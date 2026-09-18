import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cakeImages } from "../assets/cakes";
import { eyeIcons, profileIcons } from "../assets/icons";
import { AppHeader } from "../components/AppHeader";
import type { Locale } from "../domain/types";
import { consecutiveStreak, monthCompletionPercent } from "../lib/insightStats";
import { AuthError, DEFAULT_NICKNAME, displayNickname, getSession, signIn, signOut, updateNickname } from "../platform/auth";
import { listEntries, todayKey } from "../platform/localEntries";
import { getPrefs, setLocale, setThemeId } from "../platform/prefs";
import { CAKES } from "../theme/cakes";
import "./Settings.css";

type Mode = "login" | "reset";

const COPY = {
  ko: {
    title: "설정",
    brand: "Piece of Mind",
    subtitle: "로그인하여 오늘의 조각들을 안전하게 보관하세요.",
    email: "이메일",
    password: "비밀번호",
    showPassword: "비밀번호 보기",
    hidePassword: "비밀번호 숨기기",
    login: "로그인",
    forgot: "비밀번호를 잊어 버리셨나요?",
    reset: "비밀번호 재설정",
    noAccount: "계정이 없으신가요?",
    signup: "회원가입",
    sns: "또는 SNS 계정으로 로그인",
    google: "Google로 로그인",
    kakao: "카카오톡으로 로그인",
    theme: "테마 색상",
    language: "언어",
    later: "곧 연결할게요.",
    needFields: "이메일과 비밀번호를 입력해 주세요.",
    invalidEmail: "이메일 형식을 확인해 주세요.",
    shortPassword: "비밀번호는 6자 이상이어야 해요.",
    missingAccount: "가입된 계정이 없어요. 먼저 회원가입을 해 주세요.",
    badPassword: "비밀번호가 올바르지 않아요.",
    invalidCredentials: "이메일 또는 비밀번호를 확인해 주세요.",
    confirmEmail: "이메일 확인 링크를 누른 뒤 로그인해 주세요.",
    unavailable: "계정 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
    resetHint: "재설정 메일은 아직 보내지 않아요. 이메일을 확인해 주세요.",
    signedIn: "으로 로그인되어 있어요.",
    logout: "로그아웃",
    welcome: "로그인한 기기의 조각이 계정에 모여요.",
    hasAccount: "이미 계정이 있으신가요?",
    member: "일반 회원",
    nickname: "닉네임",
    editNickname: "닉네임 수정",
    changePassword: "비밀번호 변경",
    activity: "활동",
    streakLabel: "현재 연속 기록일",
    totalLabel: "총 기록 일수",
    monthLabel: "이달 달성",
    leave: "회원 탈퇴",
  },
  en: {
    title: "Settings",
    brand: "Piece of Mind",
    subtitle: "Sign in to keep today’s pieces safe.",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    login: "Log in",
    forgot: "Forgot your password?",
    reset: "Reset password",
    noAccount: "Don’t have an account?",
    signup: "Sign up",
    sns: "Or continue with",
    google: "Continue with Google",
    kakao: "Continue with Kakao",
    theme: "Theme",
    language: "Language",
    later: "Coming soon.",
    needFields: "Please enter email and password.",
    invalidEmail: "Check the email format.",
    shortPassword: "Password must be at least 6 characters.",
    missingAccount: "No account yet. Please sign up first.",
    badPassword: "That password is incorrect.",
    invalidCredentials: "Check the email or password.",
    confirmEmail: "Confirm the email link, then log in.",
    unavailable: "Can’t reach the account server. Try again shortly.",
    resetHint: "Reset email is not sent yet. Check the address you entered.",
    signedIn: "is signed in.",
    logout: "Log out",
    welcome: "Your pieces stay with this account on any device.",
    hasAccount: "Already have an account?",
    member: "Member",
    nickname: "Nickname",
    editNickname: "Edit nickname",
    changePassword: "Change password",
    activity: "Activity",
    streakLabel: "Current streak",
    totalLabel: "Total days",
    monthLabel: "This month",
    leave: "Delete account",
  },
} as const;

export function Settings() {
  const navigate = useNavigate();
  const prefs = getPrefs();
  const [locale, setLocaleState] = useState<Locale>(prefs.locale);
  const [themeId, setThemeState] = useState(prefs.themeId);
  const [session, setSessionState] = useState(getSession());
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(() => displayNickname(getSession(), prefs.locale));
  const [note, setNote] = useState<string | null>(null);
  const [noteDanger, setNoteDanger] = useState(false);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const t = COPY[locale];
  const entries = listEntries();
  const streak = consecutiveStreak(entries, todayKey());
  const totalPieces = entries.length;
  const monthPercent = monthCompletionPercent(entries);

  const AUTH_NOTES = {
    need_fields: t.needFields,
    invalid_email: t.invalidEmail,
    short_password: t.shortPassword,
    no_account: t.missingAccount,
    bad_password: t.badPassword,
    email_taken: t.missingAccount,
    invalid_credentials: t.invalidCredentials,
    confirm_email: t.confirmEmail,
    unavailable: t.unavailable,
  } as const;

  function showNote(text: string, danger = false) {
    setNote(text);
    setNoteDanger(danger);
  }

  async function onLogin() {
    try {
      const next = await signIn(email, password);
      setSessionState(next);
      setNicknameDraft(displayNickname(next, locale));
      setNote(null);
      setNoteDanger(false);
      setPassword("");
      setShowPassword(false);
    } catch (error) {
      if (error instanceof AuthError) {
        showNote(AUTH_NOTES[error.code], true);
        return;
      }
      throw error;
    }
  }

  async function onLogout() {
    await signOut();
    setSessionState(null);
    setMode("login");
    setNote(null);
    setNoteDanger(false);
  }

  function onReset() {
    if (!email.trim()) {
      showNote(t.needFields, true);
      return;
    }
    showNote(t.resetHint);
  }

  async function onSaveNickname(raw = nicknameDraft) {
    if (!session) return;
    const trimmed = raw.trim();
    const stored = !trimmed || trimmed === DEFAULT_NICKNAME.ko || trimmed === DEFAULT_NICKNAME.en ? "" : trimmed;
    if (stored === (session.nickname ?? "")) {
      setNicknameDraft(displayNickname(session, locale));
      return;
    }
    try {
      const next = await updateNickname(raw);
      setSessionState(next);
      setNicknameDraft(displayNickname(next, locale));
    } catch (error) {
      if (error instanceof AuthError) {
        showNote(AUTH_NOTES[error.code], true);
        setNicknameDraft(displayNickname(session, locale));
        return;
      }
      throw error;
    }
  }

  return (
    <>
      <AppHeader title={t.title} />
      <main className="settings-main">
        {session ? (
          <>
            <section className="settings-card is-profile">
              <div className="profile-header">
                <div className="profile-avatar">
                  <img src={profileIcons.user} alt="" width={28} height={28} />
                </div>
                <div className="profile-who">
                  <div className="profile-name-row">
                    <p className="profile-name">{displayNickname(session, locale)}</p>
                    <span className="profile-badge">{t.member}</span>
                  </div>
                  <p className="profile-email">{session.email}</p>
                </div>
              </div>

              <hr className="profile-rule" />

              <div className="profile-fields">
                <div className="profile-row">
                  <div className="profile-row-main">
                    <span>{t.email}</span>
                    <p className="profile-row-value is-locked">{session.email}</p>
                  </div>
                  <img className="profile-row-icon" src={profileIcons.lock} alt="" width={14} height={14} />
                </div>
                <div className="profile-row">
                  <label className="profile-row-main">
                    <span>{t.nickname}</span>
                    <input
                      ref={nicknameRef}
                      value={nicknameDraft}
                      autoComplete="nickname"
                      onChange={(event) => setNicknameDraft(event.target.value)}
                      onBlur={(event) => void onSaveNickname(event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="profile-icon-btn"
                    aria-label={t.editNickname}
                    onClick={() => nicknameRef.current?.focus()}
                  >
                    <img src={profileIcons.pen} alt="" width={14} height={14} />
                  </button>
                </div>
                <button type="button" className="profile-link-row" onClick={() => showNote(t.later)}>
                  <span>{t.changePassword}</span>
                  <img src={profileIcons.chevron} alt="" width={14} height={14} />
                </button>
              </div>

              <button type="button" className="settings-logout-btn" onClick={() => void onLogout()}>
                {t.logout}
              </button>

              <div className="profile-stats">
                <hr className="profile-rule" />
                <p className="profile-stats-kicker">{t.activity}</p>
                <div className="profile-stats-row">
                  <div className="profile-stat">
                    <p>{t.streakLabel}</p>
                    <strong>{locale === "ko" ? `${streak}일 연속` : `${streak}-day streak`}</strong>
                  </div>
                  <div className="profile-stat">
                    <p>{t.totalLabel}</p>
                    <strong>{locale === "ko" ? `${totalPieces}조각` : `${totalPieces} pieces`}</strong>
                  </div>
                  <div className="profile-stat is-month">
                    <p>{t.monthLabel}</p>
                    <strong>{monthPercent}%</strong>
                  </div>
                </div>
              </div>
            </section>
            <button type="button" className="profile-leave" onClick={() => showNote(t.later)}>
              {t.leave}
            </button>
            {note ? <p className={`settings-note${noteDanger ? " is-danger" : ""}`}>{note}</p> : null}
          </>
        ) : (
          <section className="settings-card">
            <div className="settings-intro">
              <p className="settings-brand">{t.brand}</p>
              <p className="settings-sub">{t.subtitle}</p>
            </div>
            <form
              className="settings-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (mode === "reset") onReset();
                else void onLogin();
              }}
            >
              <div className="settings-fields">
                <div className="settings-field">
                  <label className="settings-field-main">
                    <span>{t.email}</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      placeholder="example@example.com"
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                </div>
                {mode !== "reset" ? (
                  <div className="settings-field">
                    <label className="settings-field-main">
                      <span>{t.password}</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        placeholder="••••••••••••"
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="settings-eye"
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((open) => !open)}
                    >
                      <span
                        className="settings-eye-icon"
                        style={{
                          ["--eye" as string]: `url(${showPassword ? eyeIcons.visible : eyeIcons.hidden})`,
                        }}
                        aria-hidden
                      />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="settings-actions">
                <button type="submit" className="settings-login-btn">
                  {mode === "reset" ? t.reset : t.login}
                </button>
                {note ? <p className={`settings-note${noteDanger ? " is-danger" : ""}`}>{note}</p> : null}
                <div className="settings-links">
                  <p>
                    {mode === "reset" ? null : `${t.forgot} `}
                    <button type="button" onClick={() => setMode(mode === "reset" ? "login" : "reset")}>
                      {mode === "reset" ? t.login : t.reset}
                    </button>
                  </p>
                  <p>
                    {t.noAccount}{" "}
                    <button type="button" onClick={() => navigate("/signup")}>
                      {t.signup}
                    </button>
                  </p>
                </div>
                <div className="settings-sns">
                  <p className="settings-sns-label">{t.sns}</p>
                  <button type="button" className="sns-btn is-google" onClick={() => showNote(t.later)}>
                    <GoogleIcon />
                    {t.google}
                  </button>
                  <button type="button" className="sns-btn is-kakao" onClick={() => showNote(t.later)}>
                    <KakaoIcon />
                    {t.kakao}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        <hr className="settings-rule" />

        <section className="settings-block">
          <p className="settings-kicker">{t.theme}</p>
          <div className="cake-grid">
            {CAKES.map((cake) => (
              <button
                key={cake.id}
                type="button"
                className={`cake-card${themeId === cake.id ? " is-selected" : ""}`}
                aria-pressed={themeId === cake.id}
                onClick={() => {
                  setThemeId(cake.id);
                  setThemeState(cake.id);
                }}
              >
                <span className="cake-art">
                  <img src={cakeImages[cake.id]} alt="" width={88} height={88} />
                </span>
                <span>{locale === "en" ? cake.labelEn : cake.labelKo}</span>
              </button>
            ))}
          </div>
        </section>

        <hr className="settings-rule" />

        <section className="settings-block">
          <p className="settings-kicker">{t.language}</p>
          <div className="lang-row">
            <button
              type="button"
              className={`lang-chip${locale === "ko" ? " is-selected" : ""}`}
              aria-pressed={locale === "ko"}
              onClick={() => {
                setLocale("ko");
                setLocaleState("ko");
              }}
            >
              한국어
            </button>
            <button
              type="button"
              className={`lang-chip${locale === "en" ? " is-selected" : ""}`}
              aria-pressed={locale === "en"}
              onClick={() => {
                setLocale("en");
                setLocaleState("en");
              }}
            >
              English
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path fill="#4285F4" d="M19.6 10.23c0-.82-.07-1.4-.23-2.01H10v3.64h5.48c-.11.92-.72 2.3-2.07 3.23l-.02.12 3 2.32.21.02c1.9-1.75 3-4.32 3-7.32z" />
      <path fill="#34A853" d="M10 20c2.7 0 4.97-.89 6.63-2.45l-3.16-2.45c-.85.59-1.99 1-3.47 1-2.65 0-4.9-1.75-5.7-4.18l-.12.01-3.09 2.4-.04.11C2.69 17.73 6.09 20 10 20z" />
      <path fill="#FBBC05" d="M4.3 11.92A6.03 6.03 0 0 1 4 10c0-.67.12-1.31.29-1.92l-.01-.13-3.13-2.43-.1.05A9.99 9.99 0 0 0 0 10c0 1.61.39 3.14 1.05 4.48l3.25-2.56z" />
      <path fill="#EA4335" d="M10 3.9c1.88 0 3.15.81 3.87 1.49l2.83-2.76C14.96.89 12.7 0 10 0 6.09 0 2.69 2.27 1.05 5.52l3.24 2.56C5.1 5.65 7.35 3.9 10 3.9z" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        fill="currentColor"
        d="M10 3C5.86 3 2.5 5.69 2.5 9c0 2.12 1.4 3.98 3.5 5.06l-.7 2.6c-.07.26.24.47.46.32l3.1-2.06c.37.04.75.08 1.14.08 4.14 0 7.5-2.69 7.5-6S14.14 3 10 3z"
      />
    </svg>
  );
}
