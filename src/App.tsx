import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { PublicLayout } from "./components/layout/PublicLayout";
import AboutPage from "./pages/AboutPage";
import BusinessScanPage from "./pages/BusinessScanPage";
import DashboardPage from "./pages/DashboardPage";
import DossierPage from "./pages/DossierPage";
import ExamplesPage from "./pages/ExamplesPage";
import LandingPage from "./pages/LandingPage";
import ProofCheckPage from "./pages/ProofCheckPage";
import ScanPage from "./pages/ScanPage";
import SharePage from "./pages/SharePage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ScanPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/start" element={<Navigate to="/scan" replace />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/scan/:id" element={<BusinessScanPage />} />
        <Route path="/proof-check/:id" element={<ProofCheckPage />} />
        <Route path="/app/dossier/:id" element={<DossierPage />} />
      </Route>
      <Route path="/share/:shareToken" element={<SharePage />} />
      <Route path="/share/:shareToken/investor" element={<SharePage mode="investor" />} />
      <Route path="/share/:shareToken/builder" element={<SharePage mode="builder" />} />
      <Route path="/share/:shareToken/accelerator" element={<SharePage mode="accelerator" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
