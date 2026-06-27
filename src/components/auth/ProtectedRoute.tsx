import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../../services/authService";
import type { AuthSession, UserRole } from "../../types";
import { Card } from "../ui/Card";

export function ProtectedRoute({
  children,
  role
}: {
  children: ReactNode;
  role?: UserRole;
}) {
  const [session, setSession] = useState<AuthSession | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.currentSession().then((next) => {
      setSession(next);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card className="p-8 text-center">Checking account...</Card>
      </main>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (role && session.user.role !== role) return <Navigate to="/app/dashboard" replace />;

  return <>{children}</>;
}
