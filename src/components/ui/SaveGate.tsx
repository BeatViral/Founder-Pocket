import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { analyticsService } from "../../services/analyticsService";
import { authService } from "../../services/authService";
import { storageService } from "../../services/storageService";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import type { UserProfile } from "../../types";
import { Button } from "./Button";
import { FieldLabel, Input } from "./FormControls";
import { Modal } from "./Modal";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | undefined>();

  useEffect(() => {
    storageService.getUserProfile().then(setProfile).catch(() => setProfile(undefined));
  }, []);

  return {
    profile,
    async saveProfile(value: { name: string; email: string; password?: string }) {
      const session = await authService.signup(value);
      setProfile(session.user);
      return session.user;
    }
  };
}

export function SaveGate({
  open,
  onClose,
  onSaved
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { saveProfile } = useUserProfile();
  const supabaseMode = isSupabaseConfigured();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await analyticsService.track("signup_started", { source: "save_gate" });
      await saveProfile({ name, email, password });
      await analyticsService.track("signup_completed", { source: "save_gate" });
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Create a free account" onClose={onClose}>
      <p className="mb-5 text-sm leading-6 text-slate-300">
        {supabaseMode
          ? "Create a free account to save, edit, export, and share this in Supabase."
          : "Create a free account to save, edit, export, and share this. This demo uses localStorage only."}
      </p>
      <form className="space-y-4" onSubmit={submit}>
        <FieldLabel label="Name">
          <Input required value={name} onChange={(event) => setName(event.target.value)} />
        </FieldLabel>
        <FieldLabel label="Email">
          <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FieldLabel>
        {supabaseMode ? (
          <FieldLabel label="Password">
            <Input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FieldLabel>
        ) : null}
        {error ? <p className="rounded-md border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? "Saving..." : "Save and continue"}
        </Button>
      </form>
    </Modal>
  );
}
