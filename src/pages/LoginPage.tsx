import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Input } from "../components/ui/FormControls";
import { analyticsService } from "../services/analyticsService";
import { authService } from "../services/authService";
import { isSupabaseConfigured } from "../services/supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const supabaseMode = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login({ email, password });
      navigate("/app/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not log in.");
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    await authService.continueAsGuest();
    navigate("/scan");
  };

  return (
    <main className="mx-auto grid min-h-[72vh] max-w-xl place-items-center px-4 py-12">
      <Card className="w-full p-6">
        <Badge tone="info">{supabaseMode ? "Supabase account" : "Local account"}</Badge>
        <h1 className="mt-4 text-3xl font-black">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {supabaseMode
            ? "Use the account connected to the Founder Pocket Supabase project."
            : "Local demo auth is active. Use any email, or include \"admin\" to open the admin dashboard."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FieldLabel label="Email">
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FieldLabel>
          <FieldLabel label="Password">
            <Input required={supabaseMode} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FieldLabel>
          {error ? <p className="rounded-md border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
          <Button type="submit" fullWidth disabled={loading}>{loading ? "Logging in..." : "Log in"}</Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <button type="button" onClick={guest} className="text-slate-300 hover:text-white">
            Continue as guest
          </button>
          <Link to="/signup" className="text-signal hover:text-cyan-200" onClick={() => analyticsService.track("signup_started", { source: "login_link" })}>
            Create account
          </Link>
        </div>
      </Card>
    </main>
  );
}
