import { apiClient } from "./apiClient";
import { storageService } from "./storageService";
import type { AuthSession, UserProfile } from "../types";

const roleForEmail = (email: string): UserProfile["role"] =>
  /admin/i.test(email) ? "admin" : "user";

export const authService = {
  async currentSession(): Promise<AuthSession | undefined> {
    const backend = await apiClient.auth.me().catch(() => undefined);
    if (backend && typeof backend === "object" && "user" in backend) return backend as AuthSession;

    const user = await storageService.getUserProfile();
    return user ? { user, mode: "mock" } : undefined;
  },

  async signup(value: { name: string; email: string; password?: string }): Promise<AuthSession> {
    const backend = await apiClient.auth.register(value).catch(() => undefined);
    if (backend && typeof backend === "object" && "user" in backend) return backend as AuthSession;

    const user = await storageService.saveUserProfile({
      name: value.name,
      email: value.email,
      role: roleForEmail(value.email)
    });
    return { user, mode: "mock" };
  },

  async login(value: { email: string; password?: string }): Promise<AuthSession> {
    const backend = await apiClient.auth.login(value).catch(() => undefined);
    if (backend && typeof backend === "object" && "user" in backend) return backend as AuthSession;

    const existing = await storageService.getUserProfile();
    const user = await storageService.saveUserProfile({
      name: existing?.name ?? value.email.split("@")[0] ?? "Founder",
      email: value.email,
      role: roleForEmail(value.email)
    });
    return { user, mode: "mock" };
  },

  async logout() {
    await apiClient.auth.logout().catch(() => undefined);
    await storageService.clearUserProfile();
  },

  async continueAsGuest(): Promise<AuthSession> {
    return {
      user: {
        id: "guest",
        name: "Guest",
        email: "guest@local",
        role: "user",
        createdAt: new Date().toISOString()
      },
      mode: "guest"
    };
  }
};
