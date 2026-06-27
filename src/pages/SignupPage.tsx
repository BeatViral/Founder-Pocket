import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldLabel, Input } from "../components/ui/FormControls";
import { analyticsService } from "../services/analyticsService";
import { authService } from "../services/authService";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await analyticsService.track("signup_started", { source: "signup_page" });
    await authService.signup({ name, email, password });
    await analyticsService.track("signup_completed", { source: "signup_page" });
    navigate("/app/dashboard");
  };

  return (
    <main className="mx-auto grid min-h-[72vh] max-w-xl place-items-center px-4 py-12">
      <Card className="w-full p-6">
        <Badge tone="info">Free local account</Badge>
        <h1 className="mt-4 text-3xl font-black">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Save scans, edit dossiers, share demo links, and prepare exports. Backend auth can replace this mock flow later.
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <FieldLabel label="Name">
            <Input required value={name} onChange={(event) => setName(event.target.value)} />
          </FieldLabel>
          <FieldLabel label="Email">
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FieldLabel>
          <FieldLabel label="Password">
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FieldLabel>
          <Button type="submit" fullWidth>Create account</Button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          Already have one? <Link to="/login" className="text-signal">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
