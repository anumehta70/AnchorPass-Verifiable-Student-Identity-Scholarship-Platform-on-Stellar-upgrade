import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet.tsx";

export function HomePage() {
  const { connect, address } = useWallet();

  return (
    <div>
      <section className="paper-texture relative overflow-hidden border-b border-ink/10 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-seal">
            Built on Stellar · Soroban Smart Contracts
          </p>
          <h1 className="font-display text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            Scholarships and credentials,
            <br />
            <span className="text-institution">verifiable in seconds.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-lg text-ink/60">
            AnchorPass issues tamper-proof digital credentials on-chain, so any
            employer, university, or verifier can confirm authenticity — no
            phone calls, no forged PDFs, no waiting.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {address ? (
              <Link
                to="/institutions"
                className="rounded-full bg-institution px-7 py-3 font-body font-semibold text-paper hover:bg-ink"
              >
                Launch Dashboard
              </Link>
            ) : (
              <button
                onClick={connect}
                className="rounded-full bg-institution px-7 py-3 font-body font-semibold text-paper hover:bg-ink"
              >
                Connect Wallet
              </button>
            )}
            <Link
              to="/verify"
              className="rounded-full border border-ink/20 px-7 py-3 font-body font-semibold text-ink hover:border-institution hover:text-institution"
            >
              Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Institutions issue",
              body: "Create scholarship campaigns, assign eligible students by wallet, and issue on-chain credentials in a few clicks.",
            },
            {
              title: "Students claim",
              body: "Connect a wallet, claim assigned scholarships, and hold verifiable credentials that never expire or get lost.",
            },
            {
              title: "Anyone verifies",
              body: "Scan a QR code or open a link — verification reads directly from the Stellar ledger, not a database anyone can edit.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-ink/10 bg-white p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 font-body text-sm text-ink/60">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
