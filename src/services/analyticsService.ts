import { apiClient } from "./apiClient";
import { storageService } from "./storageService";
import type { AnalyticsEvent } from "../types";

const id = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `event_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export type AnalyticsEventName =
  | "observation_submitted"
  | "scan_generated"
  | "angle_selected"
  | "proof_check_started"
  | "proof_check_completed"
  | "dossier_generated"
  | "section_edited"
  | "section_copied"
  | "share_link_created"
  | "share_link_viewed"
  | "pdf_exported"
  | "validation_task_completed"
  | "signup_started"
  | "signup_completed"
  | "dashboard_opened";

export const analyticsService = {
  async track(eventName: AnalyticsEventName, properties: Record<string, unknown> = {}) {
    const user = await storageService.getUserProfile();
    const event: AnalyticsEvent = {
      id: id(),
      userId: user?.id,
      eventName,
      properties,
      createdAt: new Date().toISOString()
    };

    await storageService.saveAnalyticsEvent(event);
    await apiClient.analytics.track(event).catch(() => undefined);
    return event;
  },

  listEvents() {
    return storageService.listAnalyticsEvents();
  }
};
