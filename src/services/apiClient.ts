const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787/api";
const BACKEND_ENABLED = import.meta.env.VITE_ENABLE_BACKEND === "true";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T | undefined> {
  if (!BACKEND_ENABLED) return undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`API ${method} ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  backendEnabled: BACKEND_ENABLED,

  auth: {
    register: (body: unknown) => request("POST", "/auth/register", body),
    login: (body: unknown) => request("POST", "/auth/login", body),
    logout: () => request("POST", "/auth/logout"),
    me: () => request("GET", "/auth/me")
  },

  user: {
    getProfile: () => request("GET", "/user/profile"),
    updateProfile: (body: unknown) => request("PATCH", "/user/profile", body)
  },

  observations: {
    create: (body: unknown) => request("POST", "/observations", body),
    list: () => request("GET", "/observations"),
    get: (id: string) => request("GET", `/observations/${id}`),
    update: (id: string, body: unknown) => request("PATCH", `/observations/${id}`, body),
    delete: (id: string) => request("DELETE", `/observations/${id}`)
  },

  scans: {
    create: (body: unknown) => request("POST", "/scans", body),
    list: () => request("GET", "/scans"),
    get: (id: string) => request("GET", `/scans/${id}`),
    delete: (id: string) => request("DELETE", `/scans/${id}`),
    angles: (scanId: string) => request("GET", `/scans/${scanId}/angles`)
  },

  angles: {
    select: (angleId: string, body?: unknown) => request("POST", `/angles/${angleId}/select`, body)
  },

  proof: {
    create: (angleId: string, body: unknown) => request("POST", `/proof-check/${angleId}`, body),
    get: (id: string) => request("GET", `/proof-check/${id}`),
    update: (id: string, body: unknown) => request("PATCH", `/proof-check/${id}`, body)
  },

  dossiers: {
    create: (body: unknown) => request("POST", "/dossiers", body),
    list: () => request("GET", "/dossiers"),
    get: (id: string) => request("GET", `/dossiers/${id}`),
    update: (id: string, body: unknown) => request("PATCH", `/dossiers/${id}`, body),
    delete: (id: string) => request("DELETE", `/dossiers/${id}`),
    updateSection: (dossierId: string, sectionId: string, body: unknown) =>
      request("PATCH", `/dossiers/${dossierId}/sections/${sectionId}`, body),
    regenerateSection: (dossierId: string, sectionId: string, body?: unknown) =>
      request("POST", `/dossiers/${dossierId}/sections/${sectionId}/regenerate`, body),
    exportPdf: (dossierId: string, body?: unknown) => request("POST", `/dossiers/${dossierId}/export/pdf`, body),
    exportJson: (dossierId: string, body?: unknown) => request("POST", `/dossiers/${dossierId}/export/json`, body),
    exportPack: (dossierId: string) => request("GET", `/dossiers/${dossierId}/export-pack`)
  },

  validation: {
    list: (dossierId: string) => request("GET", `/dossiers/${dossierId}/validation`),
    createTask: (dossierId: string, body: unknown) => request("POST", `/dossiers/${dossierId}/validation/tasks`, body),
    updateTask: (taskId: string, body: unknown) => request("PATCH", `/validation/tasks/${taskId}`, body),
    deleteTask: (taskId: string) => request("DELETE", `/validation/tasks/${taskId}`)
  },

  sharing: {
    create: (dossierId: string, body: unknown) => request("POST", `/dossiers/${dossierId}/share`, body),
    get: (token: string) => request("GET", `/share/${token}`),
    update: (shareId: string, body: unknown) => request("PATCH", `/share/${shareId}`, body),
    delete: (shareId: string) => request("DELETE", `/share/${shareId}`),
    recordView: (token: string, body?: unknown) => request("POST", `/share/${token}/view`, body)
  },

  ai: {
    generateScan: (body: unknown) => request("POST", "/ai/generate-scan", body),
    generateAngles: (body: unknown) => request("POST", "/ai/generate-angles", body),
    generateProofQuestions: (body: unknown) => request("POST", "/ai/generate-proof-questions", body),
    generateDossier: (body: unknown) => request("POST", "/ai/generate-dossier", body),
    regenerateSection: (body: unknown) => request("POST", "/ai/regenerate-section", body),
    founderFitAnalysis: (body: unknown) => request("POST", "/ai/founder-fit-analysis", body)
  },

  analytics: {
    track: (body: unknown) => request("POST", "/analytics/events", body)
  },

  admin: {
    metrics: () => request("GET", "/admin/metrics"),
    users: () => request("GET", "/admin/users"),
    dossiers: () => request("GET", "/admin/dossiers"),
    events: () => request("GET", "/admin/events"),
    aiJobs: () => request("GET", "/admin/ai-jobs"),
    updateSettings: (body: unknown) => request("PATCH", "/admin/settings", body)
  }
};
