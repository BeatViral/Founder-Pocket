import { sampleDossiers, sampleScans } from "../lib/sampleData";
import type { AppData, BusinessScan, StartupDossier, UserProfile } from "../types";

const DATA_KEY = "founder-pocket:observation-engine:data";

const fallbackData = (): AppData =>
  JSON.parse(
    JSON.stringify({
      scans: sampleScans,
      dossiers: sampleDossiers
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
      userProfile: parsed.userProfile
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

  async saveUserProfile(profile: Omit<UserProfile, "id" | "createdAt">) {
    const data = readData();
    const userProfile: UserProfile = {
      id: data.userProfile?.id ?? `user_${Date.now()}`,
      createdAt: data.userProfile?.createdAt ?? new Date().toISOString(),
      ...profile
    };
    writeData({ ...data, userProfile });
    return userProfile;
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
  }
};
