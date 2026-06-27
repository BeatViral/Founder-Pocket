import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Input } from "../components/ui/FormControls";
import { analyticsService } from "../services/analyticsService";
import { authService } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await authService.login({ email, password });
    navigate("/app/dashboard");
  };

  const guest = async () => {
    await authService.continueAsGuest();
    navigate("/scan");
  };

  return (
    <main className="mx-auto grid min-h-[72vh] max-w-xl place-items-center px-4 py-12">
      <Card className="w-full p-6">
        <Badge tone="info">Local account</Badge>
        <h1 className="mt-4 text-3xl font-black">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Mock auth is active until the backend is connected. Use any email, or include "admin" to open the admin dashboard.
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FieldLabel label="Email">
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FieldLabel>
          <FieldLabel label="Password">
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FieldLabel>
          <Button type="submit" fullWidth>Log in</Button>
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
