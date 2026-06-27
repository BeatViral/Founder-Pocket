import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { PublicLayout } from "./components/layout/PublicLayout";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import BusinessScanPage from "./pages/BusinessScanPage";
import DashboardPage from "./pages/DashboardPage";
import DossierPage from "./pages/DossierPage";
import ExamplesPage from "./pages/ExamplesPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PricingPage from "./pages/PricingPage";
import PrivacyPage from "./pages/PrivacyPage";
import ProofCheckPage from "./pages/ProofCheckPage";
import ScanPage from "./pages/ScanPage";
import SharePage from "./pages/SharePage";
import SignupPage from "./pages/SignupPage";
import TermsPage from "./pages/TermsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ScanPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/start" element={<Navigate to="/scan" replace />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/app/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/app/scan/:id" element={<BusinessScanPage />} />
        <Route path="/proof-check/:id" element={<ProofCheckPage />} />
        <Route path="/app/dossier/:id" element={<ProtectedRoute><DossierPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
      </Route>
      <Route path="/share/:shareToken" element={<SharePage />} />
      <Route path="/share/:shareToken/investor" element={<SharePage mode="investor" />} />
      <Route path="/share/:shareToken/builder" element={<SharePage mode="builder" />} />
      <Route path="/share/:shareToken/accelerator" element={<SharePage mode="accelerator" />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}
