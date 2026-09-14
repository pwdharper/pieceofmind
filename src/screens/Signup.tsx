import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { eyeIcons } from "../assets/icons";
import { AppHeader } from "../components/AppHeader";
import { useLocale } from "../hooks/useLocale";
import { getSession, setSession } from "../platform/prefs";
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

  function onSubmit() {
    if (!email.trim() || !password.trim()) {
      setNote(t.needFields);
      return;
    }
    setSession(email.trim(), nickname);
    navigate("/settings", { replace: true });
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
            onSubmit();
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
            {note ? <p className="settings-note">{note}</p> : null}
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
