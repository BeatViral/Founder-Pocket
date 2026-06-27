import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Input, Select, Textarea } from "../components/ui/FormControls";
import { authService } from "../services/authService";
import { storageService } from "../services/storageService";
import type { FounderProfile, UserProfile } from "../types";

const emptyFounderProfile = (user: UserProfile): Omit<FounderProfile, "id" | "userId" | "createdAt" | "updatedAt"> => ({
  background: "",
  roleType: "",
  industry: "",
  yearsExperience: 0,
  strengths: [],
  communicationStyle: "plain",
  riskComfort: "moderate",
  validationComfort: "interview-first",
  technicalAbility: "can brief a builder",
  networkAccess: ""
});

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | undefined>();
  const [profile, setProfile] = useState<Omit<FounderProfile, "id" | "userId" | "createdAt" | "updatedAt">>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([storageService.getUserProfile(), storageService.getFounderProfile()]).then(([nextUser, founder]) => {
      setUser(nextUser);
      setProfile(founder ?? (nextUser ? emptyFounderProfile(nextUser) : undefined));
    });
  }, []);

  if (!user || !profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card className="p-8 text-center">Create an account to edit profile settings.</Card>
      </main>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await storageService.saveFounderProfile(profile);
    setSaved(true);
  };

  const logout = async () => {
    await authService.logout();
    navigate("/");
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="info">Account</Badge>
          <h1 className="mt-3 text-4xl font-black">{user.name}</h1>
          <p className="mt-2 text-slate-400">{user.email} · {user.role}</p>
        </div>
        <Button variant="secondary" onClick={logout}>Log out</Button>
      </div>
      <Card className="p-6">
        <form className="space-y-5" onSubmit={submit}>
          <FieldLabel label="Founder background">
            <Textarea value={profile.background} onChange={(event) => setProfile({ ...profile, background: event.target.value })} />
          </FieldLabel>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldLabel label="Role type">
              <Input value={profile.roleType} onChange={(event) => setProfile({ ...profile, roleType: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Industry">
              <Input value={profile.industry} onChange={(event) => setProfile({ ...profile, industry: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Years experience">
              <Input type="number" min={0} value={profile.yearsExperience} onChange={(event) => setProfile({ ...profile, yearsExperience: Number(event.target.value) })} />
            </FieldLabel>
            <FieldLabel label="Communication style">
              <Select value={profile.communicationStyle} onChange={(event) => setProfile({ ...profile, communicationStyle: event.target.value })}>
                <option>plain</option>
                <option>technical</option>
                <option>structured</option>
                <option>narrative</option>
                <option>commercial</option>
                <option>practical</option>
              </Select>
            </FieldLabel>
            <FieldLabel label="Risk comfort">
              <Input value={profile.riskComfort} onChange={(event) => setProfile({ ...profile, riskComfort: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Validation comfort">
              <Input value={profile.validationComfort} onChange={(event) => setProfile({ ...profile, validationComfort: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Technical ability">
              <Input value={profile.technicalAbility} onChange={(event) => setProfile({ ...profile, technicalAbility: event.target.value })} />
            </FieldLabel>
            <FieldLabel label="Network access">
              <Input value={profile.networkAccess} onChange={(event) => setProfile({ ...profile, networkAccess: event.target.value })} />
            </FieldLabel>
          </div>
          <FieldLabel label="Strengths" helper="Comma-separated strengths.">
            <Input
              value={profile.strengths.join(", ")}
              onChange={(event) => setProfile({ ...profile, strengths: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
            />
          </FieldLabel>
          <Button type="submit">Save profile</Button>
          {saved ? <span className="ml-3 text-sm text-signal">Saved</span> : null}
        </form>
      </Card>
    </main>
  );
}
