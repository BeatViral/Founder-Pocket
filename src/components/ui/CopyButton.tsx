import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { analyticsService } from "../../services/analyticsService";
import { Button } from "./Button";

export function CopyButton({
  text,
  label = "Copy",
  variant = "secondary"
}: {
  text: string;
  label?: string;
  variant?: "secondary" | "ghost" | "quiet";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    await analyticsService.track("section_copied", { label });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant={variant}
      icon={copied ? <Check size={16} /> : <Copy size={16} />}
      onClick={copy}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
