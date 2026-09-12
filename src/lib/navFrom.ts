export type NavFrom = "home" | "insights";

type NavState = {
  from?: NavFrom;
};

export function readNavFrom(state: unknown): NavFrom {
  const from = (state as NavState | null)?.from;
  return from === "insights" ? "insights" : "home";
}

export function originPath(from: NavFrom): string {
  return from === "insights" ? "/insights" : "/";
}

export function originState(from: NavFrom): NavState {
  return { from };
}
