import type { BusinessScanStatus, DossierSection, ShareMode } from "../types";

export const statusLabels: Record<BusinessScanStatus, string> = {
  "Business angle found": "Business angle found",
  "Strong opportunity signal": "Strong opportunity signal",
  "Interesting but needs more proof": "Interesting, needs proof",
  "Weak business signal": "Weak business signal",
  "Probably not a business yet": "Probably not a business yet"
};

export const statusTone = (status: BusinessScanStatus) => {
  if (status === "Strong opportunity signal") return "success";
  if (status === "Business angle found") return "info";
  if (status === "Interesting but needs more proof") return "warning";
  return "neutral";
};

export const shareModeLabels: Record<ShareMode, string> = {
  full: "Full Mode",
  investor: "Investor Mode",
  builder: "Builder Mode",
  accelerator: "Accelerator Mode"
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function sectionPlainText(section?: DossierSection) {
  return section?.content ?? "";
}

export function fileSafeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
