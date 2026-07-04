const STEPS = [
  {
    n: "01",
    title: "Institution connects wallet",
    body: "A university, nonprofit, or scholarship fund connects their Freighter wallet and registers as an institution on-chain.",
  },
  {
    n: "02",
    title: "Institution creates a scholarship",
    body: "Set the amount, seat count, deadline, and eligibility criteria. This is recorded as a Soroban contract entry.",
  },
  {
    n: "03",
    title: "Student connects wallet",
    body: "The student connects their own Freighter wallet and is assigned to the scholarship by wallet address.",
  },
  {
    n: "04",
    title: "Student claims the scholarship",
    body: "A signed transaction confirms the claim on-chain — no intermediary can alter or fake this record.",
  },
  {
    n: "05",
    title: "Institution issues a credential",
    body: "Certificate metadata is pinned to IPFS; only the content hash is written on-chain, keeping the ledger lightweight.",
  },
  {
    n: "06",
    title: "Anyone verifies via QR or link",
    body: "A public verification page reads the credential straight from the contract — valid, revoked, issuer, and timestamp, all visible instantly.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl font-semibold text-ink">How AnchorPass works</h1>
      <p className="mt-3 font-body text-ink/60">
        Six steps from institution onboarding to public, tamper-proof verification.
      </p>

      <ol className="mt-12 space-y-10">
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-5">
            <span className="font-display text-2xl font-semibold text-seal">{step.n}</span>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 font-body text-sm text-ink/60">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
