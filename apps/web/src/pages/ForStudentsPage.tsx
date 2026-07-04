import { Link } from "react-router-dom";

export function ForStudentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-14 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-seal">For Students</p>
        <h1 className="mt-2 font-display text-5xl font-semibold text-ink">
          Your scholarship, your credential. On-chain, forever.
        </h1>
        <p className="mt-4 font-body text-lg text-ink/60">
          No lost certificates. No verification delays. When your institution issues an
          AnchorPass credential, it is written to the Stellar ledger and verifiable by any
          employer or university anywhere in the world — instantly.
        </p>
        <Link
          to="/students/dashboard"
          className="mt-6 inline-block rounded-full bg-institution px-7 py-3 font-body font-semibold text-paper hover:bg-ink"
        >
          Open Student Dashboard
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Claim with one click",
            body: "Connect your Freighter wallet, find your assigned scholarship, and sign the claim transaction. That's it.",
          },
          {
            title: "Download your certificate",
            body: "Once issued, your credential is downloadable as a PDF and shareable as a permanent verification link.",
          },
          {
            title: "Share with confidence",
            body: "Send the verification link or QR code to anyone. They'll see your credential status directly from the blockchain.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-ink/10 bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 font-body text-sm text-ink/60">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
