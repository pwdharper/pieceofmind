import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { eyeIcons } from "../assets/icons";
import { AppHeader } from "../components/AppHeader";
import { useLocale } from "../hooks/useLocale";
import { AuthError, getSession, signUp } from "../platform/auth";
import "../screens/Settings.css";
import "./Signup.css";

const COPY = {
  ko: {
    title: "회원가입",
    heading: "함께 기분을 맞춰볼까요?",
    subtitle: "매일 하루를 슥 그리는 내 안의 마음 조각 일기장",
    email: "이메일",
    password: "비밀번호",
    nickname: "닉네임",
    nicknamePlaceholder: "(선택) 닉네임을 입력해 주세요.",
    showPassword: "비밀번호 보기",
    hidePassword: "비밀번호 숨기기",
    submit: "가입하기",
    hasAccount: "이미 계정이 있으신가요?",
    login: "로그인",
    needFields: "이메일과 비밀번호를 입력해 주세요.",
    invalidEmail: "이메일 형식을 확인해 주세요.",
    shortPassword: "비밀번호는 6자 이상이어야 해요.",
    emailTaken: "이미 가입된 이메일이에요.",
    confirmEmail: "이메일 확인 링크를 누른 뒤 로그인해 주세요.",
    unavailable: "계정 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
    invalidCredentials: "이메일 또는 비밀번호를 확인해 주세요.",
  },
  en: {
    title: "Sign up",
    heading: "Shall we match moods together?",
    subtitle: "A mind-piece journal you sketch a little of each day.",
    email: "Email",
    password: "Password",
    nickname: "Nickname",
    nicknamePlaceholder: "(Optional) Enter a nickname.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submit: "Join",
    hasAccount: "Already have an account?",
    login: "Log in",
    needFields: "Please enter email and password.",
    invalidEmail: "Check the email format.",
    shortPassword: "Password must be at least 6 characters.",
    emailTaken: "That email is already registered.",
    confirmEmail: "Confirm the email link, then log in.",
    unavailable: "Can’t reach the account server. Try again shortly.",
    invalidCredentials: "Check the email or password.",
  },
} as const;

export function Signup() {
  const navigate = useNavigate();
  const locale = useLocale();
  const t = COPY[locale];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (getSession()) {
    return <Navigate to="/settings" replace />;
  }

  async function onSubmit() {
    try {
      await signUp(email, password, nickname);
      navigate("/settings", { replace: true });
    } catch (error) {
      if (error instanceof AuthError) {
        const notes = {
          need_fields: t.needFields,
          invalid_email: t.invalidEmail,
          short_password: t.shortPassword,
          email_taken: t.emailTaken,
          no_account: t.needFields,
          bad_password: t.needFields,
          invalid_credentials: t.invalidCredentials,
          confirm_email: t.confirmEmail,
          unavailable: t.unavailable,
        } as const;
        setNote(notes[error.code]);
        return;
      }
      throw error;
    }
  }

  return (
    <>
      <AppHeader title={t.title} onBack={() => navigate("/settings")} />
      <main className="signup-main">
        <div className="signup-intro">
          <h2 className="signup-heading">{t.heading}</h2>
          <p className="signup-sub">{t.subtitle}</p>
        </div>
        <form
          className="signup-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
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
            <div className="settings-field">
              <label className="settings-field-main">
                <span>{t.password}</span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
            <div className="settings-field">
              <label className="settings-field-main">
                <span>{t.nickname}</span>
                <input
                  type="text"
                  autoComplete="nickname"
                  value={nickname}
                  placeholder={t.nicknamePlaceholder}
                  onChange={(event) => setNickname(event.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="signup-actions">
            <button type="submit" className="settings-login-btn">
              {t.submit}
            </button>
            {note ? <p className="settings-note is-danger">{note}</p> : null}
            <p className="signup-login-row">
              {t.hasAccount}{" "}
              <button type="button" onClick={() => navigate("/settings")}>
                {t.login}
              </button>
            </p>
          </div>
        </form>
      </main>
    </>
  );
}
