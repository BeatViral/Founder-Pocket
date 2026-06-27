import { sampleDossiers, sampleScans } from "../lib/sampleData";
import type { AnalyticsEvent, AppData, BusinessScan, FounderProfile, StartupDossier, UserProfile } from "../types";

const DATA_KEY = "founder-pocket:observation-engine:data";

const fallbackData = (): AppData =>
  JSON.parse(
    JSON.stringify({
      scans: sampleScans,
      dossiers: sampleDossiers,
      analyticsEvents: []
    })
  ) as AppData;

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

function readData(): AppData {
  if (!canUseStorage()) return fallbackData();
  const raw = window.localStorage.getItem(DATA_KEY);
  if (!raw) {
    const data = fallbackData();
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return data;
  }

  try {
    const parsed = JSON.parse(raw) as AppData;
    return {
      scans: parsed.scans ?? [],
      dossiers: parsed.dossiers ?? [],
      userProfile: parsed.userProfile ? { ...parsed.userProfile, role: parsed.userProfile.role ?? "user" } : undefined,
      founderProfile: parsed.founderProfile,
      analyticsEvents: parsed.analyticsEvents ?? []
    };
  } catch {
    const data = fallbackData();
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return data;
  }
}

function writeData(data: AppData) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export const storageService = {
  async getUserProfile() {
    return readData().userProfile;
  },

  async saveUserProfile(profile: Omit<UserProfile, "id" | "createdAt"> & { role?: UserProfile["role"] }) {
    const data = readData();
    const userProfile: UserProfile = {
      id: data.userProfile?.id ?? `user_${Date.now()}`,
      createdAt: data.userProfile?.createdAt ?? new Date().toISOString(),
      ...profile,
      role: profile.role ?? data.userProfile?.role ?? "user"
    };
    writeData({ ...data, userProfile });
    return userProfile;
  },

  async clearUserProfile() {
    const data = readData();
    writeData({ ...data, userProfile: undefined, founderProfile: undefined });
  },

  async getFounderProfile() {
    return readData().founderProfile;
  },

  async saveFounderProfile(profile: Omit<FounderProfile, "id" | "userId" | "createdAt" | "updatedAt">) {
    const data = readData();
    const user = data.userProfile;
    if (!user) return undefined;

    const now = new Date().toISOString();
    const founderProfile: FounderProfile = {
      id: data.founderProfile?.id ?? `founder_${Date.now()}`,
      userId: user.id,
      createdAt: data.founderProfile?.createdAt ?? now,
      updatedAt: now,
      ...profile
    };

    writeData({ ...data, founderProfile });
    return founderProfile;
  },

  async listScans() {
    return readData().scans.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getScan(id: string) {
    return readData().scans.find((scan) => scan.id === id);
  },

  async saveScan(scan: BusinessScan) {
    const data = readData();
    const updated = { ...scan, updatedAt: new Date().toISOString() };
    writeData({
      ...data,
      scans: [updated, ...data.scans.filter((item) => item.id !== scan.id)]
    });
    return updated;
  },

  async deleteScan(id: string) {
    const data = readData();
    writeData({
      ...data,
      scans: data.scans.filter((scan) => scan.id !== id),
      dossiers: data.dossiers.filter((dossier) => dossier.scanId !== id)
    });
  },

  async listDossiers() {
    return readData().dossiers.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getDossier(id: string) {
    return readData().dossiers.find((dossier) => dossier.id === id);
  },

  async saveDossier(dossier: StartupDossier) {
    const data = readData();
    const updated = { ...dossier, updatedAt: new Date().toISOString() };
    writeData({
      ...data,
      dossiers: [updated, ...data.dossiers.filter((item) => item.id !== dossier.id)]
    });
    return updated;
  },

  async deleteDossier(id: string) {
    const data = readData();
    writeData({
      ...data,
      dossiers: data.dossiers.filter((dossier) => dossier.id !== id)
    });
  },

  async exportAll() {
    return readData();
  },

  async listAnalyticsEvents() {
    return readData().analyticsEvents ?? [];
  },

  async saveAnalyticsEvent(event: AnalyticsEvent) {
    const data = readData();
    writeData({
      ...data,
      analyticsEvents: [event, ...(data.analyticsEvents ?? [])].slice(0, 500)
    });
    return event;
  }
};
