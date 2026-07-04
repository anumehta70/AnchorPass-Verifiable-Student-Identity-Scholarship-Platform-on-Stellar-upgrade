import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type Credential } from "../lib/api.ts";
import { VerificationSeal } from "../components/VerificationSeal.tsx";
import { QRVerifier } from "../components/QRVerifier.tsx";
import { LoadingSpinner } from "../components/LoadingSpinner.tsx";
import { ErrorAlert } from "../components/ErrorAlert.tsx";

export function VerifyCredentialPage() {
  const { id } = useParams<{ id?: string }>();
  const [inputId, setInputId] = useState(id ?? "");
  const [credential, setCredential] = useState<(Credential & { institution?: { name: string } }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(credId: string) {
    if (!credId.trim()) return;
    setLoading(true);
    setError(null);
    setCredential(null);
    try {
      const data = await api.getCredential(credId.trim());
      setCredential(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credential not found");
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup if id is in the URL path
  useEffect(() => {
    if (id) lookup(id);
  }, [id]);

  const isValid = credential?.status === "VALID";
  const verificationUrl = credential?.verificationUrl ?? window.location.href;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-seal">Public Verification</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
          Verify a Credential
        </h1>
        <p className="mt-3 font-body text-ink/60">
          Enter a credential ID, or scan a QR code from a certificate to verify authenticity
          directly from the Stellar ledger.
        </p>
      </div>

      {/* Search box */}
      <div className="flex gap-2">
        <input
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup(inputId)}
          placeholder="Credential ID…"
          className="flex-1 rounded-full border border-ink/15 bg-white px-5 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-seal/50"
        />
        <button
          onClick={() => lookup(inputId)}
          disabled={loading}
          className="rounded-full bg-institution px-5 py-2.5 font-body text-sm font-semibold text-paper hover:bg-ink disabled:opacity-60"
        >
          Verify
        </button>
      </div>

      {loading && (
        <div className="mt-10">
          <LoadingSpinner label="Reading from Stellar ledger" />
        </div>
      )}

      {error && (
        <div className="mt-6">
          <ErrorAlert message={error} onRetry={() => lookup(inputId)} />
        </div>
      )}

      {credential && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-md">
          {/* Status header */}
          <div
            className={`flex items-center justify-between px-6 py-5 ${
              isValid
                ? "bg-verified/10 border-b border-verified/20"
                : "bg-revoked/10 border-b border-revoked/20"
            }`}
          >
            <div>
              <p
                className={`font-mono text-xs uppercase tracking-widest ${
                  isValid ? "text-verified" : "text-revoked"
                }`}
              >
                {isValid ? "✓ Valid Credential" : "✕ Credential Revoked"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                {credential.title}
              </h2>
            </div>
            <VerificationSeal status={credential.status} size="lg" />
          </div>

          {/* Details */}
          <div className="p-6">
            <dl className="space-y-3 font-body text-sm">
              <DataRow label="Student Wallet">
                <span className="font-mono text-xs break-all">{credential.studentWallet}</span>
              </DataRow>
              <DataRow label="Issuing Institution">
                <span>{credential.institutionWallet.slice(0, 6)}…{credential.institutionWallet.slice(-6)}</span>
              </DataRow>
              <DataRow label="Issue Date">
                <span>{new Date(credential.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </DataRow>
              <DataRow label="Status">
                <span className={`font-semibold ${isValid ? "text-verified" : "text-revoked"}`}>
                  {credential.status}
                </span>
              </DataRow>
              {credential.transactionHash && (
                <DataRow label="Transaction Hash">
                  <span className="font-mono text-xs break-all">{credential.transactionHash}</span>
                </DataRow>
              )}
              <DataRow label="IPFS Metadata">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${credential.ipfsHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-institution underline underline-offset-2"
                >
                  {credential.ipfsHash.slice(0, 20)}…
                </a>
              </DataRow>
            </dl>

            <div className="mt-8 flex flex-col items-center gap-4">
              <QRVerifier verificationUrl={verificationUrl} qrCodeDataUrl={credential.qrCode} />
              <p className="font-mono text-[11px] text-ink/40 text-center">
                This verification reads directly from the Stellar Testnet — no database involved.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-10 text-center font-body text-sm text-ink/40">
        Want to issue credentials?{" "}
        <Link to="/institutions" className="text-institution underline underline-offset-2">
          Connect as an institution →
        </Link>
      </p>
    </div>
  );
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
      <dt className="w-36 shrink-0 text-ink/50">{label}</dt>
      <dd className="sm:text-right">{children}</dd>
    </div>
  );
}
