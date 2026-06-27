import { supabaseClient } from "./supabaseClient";
import type {
  AnalyticsEvent,
  AppData,
  BusinessScan,
  FounderProfile,
  ShareLink,
  SharedDossierResult,
  StartupDossier,
  UserProfile
} from "../types";

type JsonRow<T> = {
  id: string;
  payload: T;
  updated_at?: string;
};

const selectPayload = <T>(rows: JsonRow<T>[]) => rows.map((row) => row.payload);

function requireSession() {
  if (!supabaseClient.isConfigured() || !supabaseClient.hasSession()) {
    throw new Error("Supabase session missing; using local fallback.");
  }
}

async function upsertPayload<T>(table: string, id: string, payload: T, extra: Record<string, unknown> = {}) {
  requireSession();
  const rows = await supabaseClient.rest<Array<JsonRow<T>>>(
    `/rest/v1/${table}?on_conflict=id`,
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify([{ id, payload, ...extra }])
    }
  );
  return rows[0]?.payload ?? payload;
}

async function listPayload<T>(table: string) {
  requireSession();
  const rows = await supabaseClient.rest<Array<JsonRow<T>>>(
    `/rest/v1/${table}?select=id,payload,updated_at&order=updated_at.desc`
  );
  return selectPayload(rows);
}

async function getPayload<T>(table: string, id: string) {
  requireSession();
  const rows = await supabaseClient.rest<Array<JsonRow<T>>>(
    `/rest/v1/${table}?id=eq.${encodeURIComponent(id)}&select=id,payload,updated_at&limit=1`
  );
  return rows[0]?.payload;
}

async function deleteRow(table: string, id: string) {
  requireSession();
  await supabaseClient.rest(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export const supabaseStorageService = {
  async getUserProfile() {
    return supabaseClient.currentUser();
  },

  async saveUserProfile(profile: Omit<UserProfile, "id" | "createdAt"> & { role?: UserProfile["role"] }) {
    const current = await supabaseClient.currentUser();
    if (!current) throw new Error("Supabase user missing.");

    const userProfile: UserProfile = {
      ...current,
      name: profile.name,
      email: profile.email,
      role: profile.role ?? current.role
    };

    return upsertPayload<UserProfile>("users", userProfile.id, userProfile, {
      auth_user_id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role
    });
  },

  async clearUserProfile() {
    await supabaseClient.signOut();
  },

  async getFounderProfile() {
    const user = await supabaseClient.currentUser();
    if (!user) throw new Error("Supabase user missing.");
    const rows = await supabaseClient.rest<Array<JsonRow<FounderProfile>>>(
      `/rest/v1/founder_profiles?user_id=eq.${encodeURIComponent(user.id)}&select=id,payload,updated_at&limit=1`
    );
    return rows[0]?.payload;
  },

  async saveFounderProfile(profile: Omit<FounderProfile, "id" | "userId" | "createdAt" | "updatedAt">) {
    const user = await supabaseClient.currentUser();
    if (!user) throw new Error("Supabase user missing.");

    const existing = await this.getFounderProfile().catch(() => undefined);
    const now = new Date().toISOString();
    const founderProfile: FounderProfile = {
      id: existing?.id ?? `founder_${user.id}`,
      userId: user.id,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...profile
    };

    return upsertPayload<FounderProfile>("founder_profiles", founderProfile.id, founderProfile, {
      user_id: user.id,
      background: founderProfile.background,
      role_type: founderProfile.roleType,
      industry: founderProfile.industry,
      years_experience: founderProfile.yearsExperience,
      strengths: founderProfile.strengths,
      communication_style: founderProfile.communicationStyle,
      risk_comfort: founderProfile.riskComfort,
      validation_comfort: founderProfile.validationComfort,
      technical_ability: founderProfile.technicalAbility,
      network_access: founderProfile.networkAccess
    });
  },

  async listScans() {
    return listPayload<BusinessScan>("business_scans");
  },

  async getScan(id: string) {
    return getPayload<BusinessScan>("business_scans", id);
  },

  async saveScan(scan: BusinessScan) {
    const user = await supabaseClient.currentUser();
    const updated = { ...scan, updatedAt: new Date().toISOString() };
    await upsertPayload("observations", scan.observationInput.id, scan.observationInput, {
      user_id: user?.id,
      text: scan.observationInput.observationText,
      context: scan.observationInput.optionalContext,
      where_noticed: scan.observationInput.whereNoticed,
      intent: scan.observationInput.desiredOutcome
    });

    return upsertPayload<BusinessScan>("business_scans", scan.id, updated, {
      user_id: user?.id,
      observation_id: scan.observationInput.id,
      summary: scan.interpretation,
      signal_types: scan.signalTypes,
      affected_groups: scan.affectedGroups,
      current_workarounds: [scan.currentWorkaround],
      business_potential_score: scan.potentialScore.total,
      status: scan.status,
      strong_signals: scan.potentialScore.strongSignals,
      weak_signals: scan.potentialScore.weakSignals,
      missing_proof: scan.potentialScore.missingProof,
      recommended_next_step: scan.potentialScore.recommendedNextStep
    });
  },

  async deleteScan(id: string) {
    await deleteRow("business_scans", id);
  },

  async listDossiers() {
    return listPayload<StartupDossier>("startup_dossiers");
  },

  async getDossier(id: string) {
    return getPayload<StartupDossier>("startup_dossiers", id);
  },

  async saveDossier(dossier: StartupDossier) {
    const user = await supabaseClient.currentUser();
    const updated = { ...dossier, updatedAt: new Date().toISOString() };
    const saved = await upsertPayload<StartupDossier>("startup_dossiers", dossier.id, updated, {
      user_id: user?.id,
      observation_id: dossier.scanId,
      business_angle_id: dossier.selectedAngle.id,
      startup_name: dossier.startupName,
      one_liner: dossier.oneLiner,
      status: dossier.status,
      readiness_score: dossier.readinessScore.total,
      founder_fit_score: dossier.founderFitEngine?.fitScore ?? dossier.selectedAngle.founderFit * 10,
      visibility: "private"
    });

    await Promise.all(
      (saved.shareLinks ?? []).map((link) =>
        upsertPayload<ShareLink>("share_links", link.id, link, {
          dossier_id: saved.id,
          token: link.shareToken,
          mode: link.mode,
          is_active: link.isActive,
          expires_at: link.expiresAt,
          view_count: link.viewCount ?? 0
        }).catch(() => undefined)
      )
    );

    return saved;
  },

  async deleteDossier(id: string) {
    await deleteRow("startup_dossiers", id);
  },

  async exportAll(): Promise<AppData> {
    const [scans, dossiers, userProfile, founderProfile, analyticsEvents] = await Promise.all([
      this.listScans(),
      this.listDossiers(),
      this.getUserProfile(),
      this.getFounderProfile().catch(() => undefined),
      this.listAnalyticsEvents().catch(() => [])
    ]);
    return { scans, dossiers, userProfile, founderProfile, analyticsEvents };
  },

  async listAnalyticsEvents() {
    return listPayload<AnalyticsEvent>("analytics_events");
  },

  async saveAnalyticsEvent(event: AnalyticsEvent) {
    const user = await supabaseClient.currentUser().catch(() => undefined);
    return upsertPayload<AnalyticsEvent>("analytics_events", event.id, event, {
      user_id: user?.id,
      event_name: event.eventName,
      properties: event.properties
    });
  },

  async getSharedDossier(shareToken: string): Promise<SharedDossierResult | undefined> {
    if (!supabaseClient.isConfigured()) throw new Error("Supabase is not configured.");

    const links = await supabaseClient.rest<Array<JsonRow<ShareLink> & {
      dossier_id: string;
      token: string;
      mode: ShareLink["mode"];
      is_active: boolean;
      expires_at?: string;
      view_count: number;
    }>>(
      `/rest/v1/share_links?token=eq.${encodeURIComponent(shareToken)}&is_active=eq.true&select=id,dossier_id,token,mode,is_active,expires_at,view_count,payload&limit=1`
    );
    const linkRow = links[0];
    if (!linkRow) return undefined;
    if (linkRow.expires_at && new Date(linkRow.expires_at).getTime() <= Date.now()) return undefined;

    const dossierRows = await supabaseClient.rest<Array<JsonRow<StartupDossier>>>(
      `/rest/v1/startup_dossiers?id=eq.${encodeURIComponent(linkRow.dossier_id)}&select=id,payload,updated_at&limit=1`
    );
    const dossier = dossierRows[0]?.payload;
    if (!dossier) return undefined;

    const shareLink = linkRow.payload ?? dossier.shareLinks.find((item) => item.shareToken === shareToken);
    if (!shareLink) return undefined;

    return {
      dossier,
      shareLink: {
        ...shareLink,
        viewCount: linkRow.view_count,
        isActive: linkRow.is_active,
        expiresAt: linkRow.expires_at
      }
    };
  },

  async recordShareView(shareToken: string): Promise<SharedDossierResult | undefined> {
    const result = await this.getSharedDossier(shareToken);
    if (!result) return undefined;

    const nextCount = (result.shareLink.viewCount ?? 0) + 1;
    await supabaseClient.rest(
      "/rest/v1/rpc/record_share_view",
      {
        method: "POST",
        body: JSON.stringify({ p_token: shareToken })
      }
    ).catch(() => undefined);

    await supabaseClient.rest(
      `/rest/v1/share_links?id=eq.${encodeURIComponent(result.shareLink.id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ view_count: nextCount })
      }
    ).catch(() => undefined);

    await supabaseClient.rest(
      "/rest/v1/share_views",
      {
        method: "POST",
        body: JSON.stringify([{ share_link_id: result.shareLink.id }])
      }
    ).catch(() => undefined);

    return {
      ...result,
      shareLink: {
        ...result.shareLink,
        viewCount: nextCount
      }
    };
  }
};
