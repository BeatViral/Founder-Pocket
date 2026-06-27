import type { UserProfile } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const APP_MODE = import.meta.env.VITE_APP_MODE ?? "local";
const SESSION_KEY = "founder-pocket:supabase-session";

type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
    };
  };
};

type SupabaseAuthResponse = Partial<SupabaseSession> & {
  session?: SupabaseSession | null;
  user?: SupabaseSession["user"];
};

const hasRealKey = (value: string) => Boolean(value && !/PASTE_|YOUR_|placeholder/i.test(value));

export const isSupabaseConfigured = () =>
  APP_MODE === "supabase" && hasRealKey(SUPABASE_URL) && hasRealKey(SUPABASE_ANON_KEY);

function readSession(): SupabaseSession | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return undefined;
  }
}

function writeSession(session?: SupabaseSession) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function headers(useUserSession = true) {
  const session = useUserSession ? readSession() : undefined;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json"
  };
}

async function request<T>(path: string, init: RequestInit = {}, useUserSession = true): Promise<T> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers(useUserSession),
      Prefer: "return=representation",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function toUserProfile(session: SupabaseSession): UserProfile {
  const user = session.user;
  const email = user?.email ?? "user@supabase.local";
  return {
    id: user?.id ?? email,
    name: user?.user_metadata?.name ?? email.split("@")[0] ?? "Founder",
    email,
    role: /admin/i.test(email) ? "admin" : "user",
    createdAt: new Date().toISOString()
  };
}

export const supabaseClient = {
  isConfigured: isSupabaseConfigured,

  hasSession() {
    return Boolean(readSession()?.access_token);
  },

  session() {
    return readSession();
  },

  async signUp(value: { name: string; email: string; password?: string }) {
    const result = await request<SupabaseAuthResponse>(
      "/auth/v1/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email: value.email,
          password: value.password || crypto.randomUUID(),
          data: { name: value.name }
        })
      },
      false
    );
    const session = result.session ?? {
      access_token: result.access_token ?? "",
      refresh_token: result.refresh_token,
      user: result.user
    };

    if (!session.access_token) {
      throw new Error("Account created. Check your email to confirm it, then log in.");
    }

    writeSession(session);
    return toUserProfile(session);
  },

  async signIn(value: { email: string; password?: string }) {
    const result = await request<SupabaseSession>(
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",
        body: JSON.stringify({
          email: value.email,
          password: value.password
        })
      },
      false
    );
    writeSession(result);
    return toUserProfile(result);
  },

  async currentUser() {
    const session = readSession();
    if (!session?.access_token) return undefined;

    const user = await request<SupabaseSession["user"]>("/auth/v1/user");
    return toUserProfile({ ...session, user });
  },

  async signOut() {
    if (readSession()?.access_token) {
      await request("/auth/v1/logout", { method: "POST" }).catch(() => undefined);
    }
    writeSession(undefined);
  },

  rest: request
};
