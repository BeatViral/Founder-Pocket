import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { analyticsService } from "../../services/analyticsService";
import { authService } from "../../services/authService";
import { storageService } from "../../services/storageService";
import type { UserProfile } from "../../types";
import { Button } from "./Button";
import { FieldLabel, Input } from "./FormControls";
import { Modal } from "./Modal";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | undefined>();

  useEffect(() => {
    storageService.getUserProfile().then(setProfile);
  }, []);

  return {
    profile,
    async saveProfile(value: { name: string; email: string }) {
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await analyticsService.track("signup_started", { source: "save_gate" });
    await saveProfile({ name, email });
    await analyticsService.track("signup_completed", { source: "save_gate" });
    onSaved();
    onClose();
  };

  return (
    <Modal open={open} title="Create a free account" onClose={onClose}>
      <p className="mb-5 text-sm leading-6 text-slate-300">
        Create a free account to save, edit, export, and share this. This demo uses localStorage only.
      </p>
      <form className="space-y-4" onSubmit={submit}>
        <FieldLabel label="Name">
          <Input required value={name} onChange={(event) => setName(event.target.value)} />
        </FieldLabel>
        <FieldLabel label="Email">
          <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FieldLabel>
        <Button type="submit" fullWidth>
          Save and continue
        </Button>
      </form>
    </Modal>
  );
}
