import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Input } from "../components/ui/FormControls";
import { analyticsService } from "../services/analyticsService";
import { authService } from "../services/authService";
import { isSupabaseConfigured } from "../services/supabaseClient";

export default function SignupPage() {
  const navigate = useNavigate();
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
      await analyticsService.track("signup_started", { source: "signup_page" });
      await authService.signup({ name, email, password });
      await analyticsService.track("signup_completed", { source: "signup_page" });
      navigate("/app/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[72vh] max-w-xl place-items-center px-4 py-12">
      <Card className="w-full p-6">
        <Badge tone="info">{supabaseMode ? "Supabase account" : "Free local account"}</Badge>
        <h1 className="mt-4 text-3xl font-black">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {supabaseMode
            ? "Save scans, edit dossiers, share links, and keep your work in the connected Supabase project."
            : "Save scans, edit dossiers, share demo links, and prepare exports in local demo mode."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FieldLabel label="Name">
            <Input required value={name} onChange={(event) => setName(event.target.value)} />
          </FieldLabel>
          <FieldLabel label="Email">
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FieldLabel>
          <FieldLabel label="Password">
            <Input required={supabaseMode} minLength={supabaseMode ? 6 : undefined} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FieldLabel>
          {error ? <p className="rounded-md border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
          <Button type="submit" fullWidth disabled={saving}>{saving ? "Creating..." : "Create account"}</Button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          Already have one? <Link to="/login" className="text-signal">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
