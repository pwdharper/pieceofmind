import type { User } from "@supabase/supabase-js";
import type { Locale } from "../domain/types";
import { hydrateEntries } from "./localEntries";
import { supabase } from "./supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthErrorCode =
  | "need_fields"
  | "invalid_email"
  | "short_password"
  | "email_taken"
  | "no_account"
  | "bad_password"
  | "invalid_credentials"
  | "confirm_email"
  | "unavailable";

export type Session = {
  email: string;
  nickname?: string;
};

export const DEFAULT_NICKNAME = {
  ko: "마음조각",
  en: "마음조각",
} as const;

export function displayNickname(session: Session | null, locale: Locale = "ko") {
  return session?.nickname?.trim() || DEFAULT_NICKNAME[locale];
}

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
    this.code = code;
  }
}

let cachedSession: Session | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function requireCredentials(email: string, password: string) {
  if (!email || !password) throw new AuthError("need_fields");
  if (!EMAIL_RE.test(email)) throw new AuthError("invalid_email");
  if (password.length < 6) throw new AuthError("short_password");
}

function requireClient() {
  if (!supabase) throw new AuthError("unavailable");
  return supabase;
}

function sessionFromUser(user: User | null): Session | null {
  if (!user?.email) return null;
  const raw = user.user_metadata?.nickname;
  const nickname = typeof raw === "string" ? raw.trim() : "";
  return nickname ? { email: user.email, nickname } : { email: user.email };
}

function mapAuthError(error: { message: string; code?: string }): AuthError {
  const message = error.message.toLowerCase();
  const code = error.code ?? "";
  if (code === "user_already_exists" || message.includes("already registered")) {
    return new AuthError("email_taken");
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return new AuthError("confirm_email");
  }
  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return new AuthError("invalid_credentials");
  }
  if (message.includes("password should be") || message.includes("password is known")) {
    return new AuthError("short_password");
  }
  return new AuthError("invalid_credentials");
}

export function getSession(): Session | null {
  return cachedSession;
}

export async function hydrateAuth() {
  if (!supabase) {
    cachedSession = null;
    return;
  }
  const { data } = await supabase.auth.getSession();
  cachedSession = sessionFromUser(data.session?.user ?? null);
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = sessionFromUser(session?.user ?? null);
  });
}

export async function hydrateApp() {
  await hydrateAuth();
  await hydrateEntries(Boolean(cachedSession));
}

export async function signUp(emailInput: string, password: string, nicknameInput?: string) {
  const client = requireClient();
  const email = normalizeEmail(emailInput);
  requireCredentials(email, password);
  const nickname = nicknameInput?.trim() || undefined;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: nickname ? { data: { nickname } } : undefined,
  });
  if (error) throw mapAuthError(error);

  if (data.user && !data.session && (data.user.identities?.length ?? 0) === 0) {
    throw new AuthError("email_taken");
  }

  let session = sessionFromUser(data.session?.user ?? data.user ?? null);
  if (!data.session) {
    const retry = await client.auth.signInWithPassword({ email, password });
    if (retry.error) throw mapAuthError(retry.error);
    session = sessionFromUser(retry.data.user);
  }

  if (!session) throw new AuthError("confirm_email");
  cachedSession = session;
  await hydrateEntries(true);
  return session;
}

export async function signIn(emailInput: string, password: string) {
  const client = requireClient();
  const email = normalizeEmail(emailInput);
  requireCredentials(email, password);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw mapAuthError(error);
  const session = sessionFromUser(data.user);
  if (!session) throw new AuthError("invalid_credentials");
  cachedSession = session;
  await hydrateEntries(true);
  return session;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  cachedSession = null;
  await hydrateEntries(false);
}

function nicknameToStore(nicknameInput: string) {
  const nickname = nicknameInput.trim();
  if (!nickname || nickname === DEFAULT_NICKNAME.ko || nickname === DEFAULT_NICKNAME.en) return "";
  return nickname;
}

export async function updateNickname(nicknameInput: string) {
  const client = requireClient();
  const nickname = nicknameToStore(nicknameInput);
  const { data, error } = await client.auth.updateUser({ data: { nickname } });
  if (error) throw mapAuthError(error);
  const session = sessionFromUser(data.user);
  if (!session) throw new AuthError("unavailable");
  cachedSession = nickname ? { ...session, nickname } : { email: session.email };
  return cachedSession;
}
