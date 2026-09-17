import { clearSession, getSession as readSession, setSession, type Session } from "./prefs";

const ACCOUNTS_KEY = "pom.accounts";
const PBKDF2_ITERATIONS = 100_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthErrorCode =
  | "need_fields"
  | "invalid_email"
  | "short_password"
  | "email_taken"
  | "no_account"
  | "bad_password";

type Account = {
  email: string;
  salt: string;
  passwordHash: string;
  nickname?: string;
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
    this.code = code;
  }
}

export type { Session };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Account[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccount(email: string) {
  return readAccounts().find((account) => account.email === email) ?? null;
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      salt: fromHex(saltHex),
    },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

function requireCredentials(email: string, password: string) {
  if (!email || !password) throw new AuthError("need_fields");
  if (!EMAIL_RE.test(email)) throw new AuthError("invalid_email");
  if (password.length < 6) throw new AuthError("short_password");
}

export function getSession(): Session | null {
  const session = readSession();
  if (!session) return null;
  const account = findAccount(normalizeEmail(session.email));
  if (!account) {
    clearSession();
    return null;
  }
  return { email: account.email, nickname: account.nickname };
}

export async function signUp(emailInput: string, password: string, nicknameInput?: string) {
  const email = normalizeEmail(emailInput);
  requireCredentials(email, password);
  if (findAccount(email)) throw new AuthError("email_taken");

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await hashPassword(password, salt);
  const nickname = nicknameInput?.trim() || undefined;
  writeAccounts([...readAccounts(), { email, salt, passwordHash, nickname }]);
  setSession(email, nickname);
  return getSession()!;
}

export async function signIn(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  requireCredentials(email, password);
  const account = findAccount(email);
  if (!account) throw new AuthError("no_account");

  const passwordHash = await hashPassword(password, account.salt);
  if (passwordHash !== account.passwordHash) throw new AuthError("bad_password");

  setSession(account.email, account.nickname);
  return getSession()!;
}

export function signOut() {
  clearSession();
}
