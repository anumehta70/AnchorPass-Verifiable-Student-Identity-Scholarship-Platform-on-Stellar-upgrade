import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet.tsx";

export function OnboardingModal() {
  const { address } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Only show once per session/connection when a user connects their wallet
    if (address && !sessionStorage.getItem("onboarding_complete")) {
      setIsOpen(true);
    }
  }, [address]);

  const handleClose = () => {
    sessionStorage.setItem("onboarding_complete", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-paper p-8 shadow-xl">
        {step === 1 && (
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-ink mb-2">Welcome to AnchorPass! 🎉</h2>
            <p className="font-body text-ink/70 mb-6">You've successfully connected your Stellar wallet. Here is what you can do next.</p>
            <div className="flex gap-4">
              <button onClick={handleClose} className="flex-1 py-2 font-body font-semibold text-ink/60 hover:text-ink">Skip</button>
              <button onClick={() => setStep(2)} className="flex-1 rounded-full bg-institution py-2 font-body font-semibold text-paper hover:bg-ink">Next: Institutions</button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-institution mb-2">For Institutions 🏫</h2>
            <p className="font-body text-ink/70 mb-6">Switch your role to Institution to create scholarships, assign students, and issue verifiable credentials on the blockchain.</p>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-2 font-body font-semibold text-ink/60 hover:text-ink">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 rounded-full bg-student py-2 font-body font-semibold text-paper hover:bg-ink">Next: Students</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-student mb-2">For Students 🎓</h2>
            <p className="font-body text-ink/70 mb-6">Switch your role to Student to claim assigned scholarships and view your cryptographic proof of funds on the Stellar ledger.</p>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-2 font-body font-semibold text-ink/60 hover:text-ink">Back</button>
              <button onClick={handleClose} className="flex-1 rounded-full bg-ink py-2 font-body font-semibold text-paper hover:bg-ink/80">Get Started</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
