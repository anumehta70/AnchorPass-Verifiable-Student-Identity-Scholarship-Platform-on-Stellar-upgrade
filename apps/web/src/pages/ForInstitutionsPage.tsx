import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Create scholarship campaigns on-chain",
    body: "Set total seats, amounts, deadlines, and eligibility. Every campaign is a Soroban contract entry — tamper-proof and timestamped.",
  },
  {
    title: "Assign students by wallet address",
    body: "No email sign-ups or passwords. Students are identified by their Stellar wallet, so records match cryptographic identities.",
  },
  {
    title: "Issue verifiable credentials",
    body: "Certificate metadata is pinned to IPFS; only the content hash goes on-chain. Employers can verify a credential in under 5 seconds, forever.",
  },
  {
    title: "Revoke credentials if needed",
    body: "If an error is made or a student becomes ineligible, credentials can be revoked on-chain. The revocation is as permanent as the issuance.",
  },
];

export function ForInstitutionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-14 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-seal">For Institutions</p>
        <h1 className="mt-2 font-display text-5xl font-semibold text-ink">
          End scholarship fraud. Automate credential issuance.
        </h1>
        <p className="mt-4 font-body text-lg text-ink/60">
          AnchorPass gives universities, nonprofits, and scholarship funds a production-ready
          toolset to create and issue tamper-proof credentials — without running blockchain
          infrastructure.
        </p>
        <Link
          to="/institutions/dashboard"
          className="mt-6 inline-block rounded-full bg-institution px-7 py-3 font-body font-semibold text-paper hover:bg-ink"
        >
          Launch Institution Dashboard
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-ink/10 bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 font-body text-sm text-ink/60">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
