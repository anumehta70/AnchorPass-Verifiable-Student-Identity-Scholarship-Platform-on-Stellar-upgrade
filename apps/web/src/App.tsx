import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { HowItWorksPage } from "./pages/HowItWorksPage.tsx";
import { ForInstitutionsPage } from "./pages/ForInstitutionsPage.tsx";
import { ForStudentsPage } from "./pages/ForStudentsPage.tsx";
import { InstitutionDashboardPage } from "./pages/InstitutionDashboardPage.tsx";
import { StudentDashboardPage } from "./pages/StudentDashboardPage.tsx";
import { VerifyCredentialPage } from "./pages/VerifyCredentialPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { DirectoryPage } from "./pages/DirectoryPage.tsx";
import { OnboardingModal } from "./components/OnboardingModal.tsx";

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-institution/20">
      <Navbar />
      <OnboardingModal />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/institutions" element={<ForInstitutionsPage />} />
          <Route path="/institutions/dashboard" element={<InstitutionDashboardPage />} />
          <Route path="/students" element={<ForStudentsPage />} />
          <Route path="/students/dashboard" element={<StudentDashboardPage />} />
          <Route path="/verify" element={<VerifyCredentialPage />} />
          <Route path="/verify/:id" element={<VerifyCredentialPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="mt-20 border-t border-ink/10 px-6 py-10 text-center font-body text-sm text-ink/40">
        <p>
          AnchorPass · Built on{" "}
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-institution"
          >
            Stellar Testnet
          </a>{" "}
          with Soroban Smart Contracts
        </p>
      </footer>
    </div>
  );
}
