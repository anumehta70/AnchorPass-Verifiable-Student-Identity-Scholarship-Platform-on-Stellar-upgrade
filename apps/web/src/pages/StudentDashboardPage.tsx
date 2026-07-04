import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../hooks/useWallet.tsx";
import { api, type Scholarship, type Credential } from "../lib/api.ts";
import { ScholarshipCard } from "../components/ScholarshipCard.tsx";
import { CredentialCard } from "../components/CredentialCard.tsx";
import { LoadingSpinner } from "../components/LoadingSpinner.tsx";
import { ErrorAlert } from "../components/ErrorAlert.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { FeedbackForm } from "../components/FeedbackForm.tsx";

export function StudentDashboardPage() {
  const { address, connect, role, setRole } = useWallet();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [s, c] = await Promise.all([
        api.listScholarships({ studentWallet: address }),
        api.listCredentialsForStudent(address),
      ]);
      setScholarships(s);
      setCredentials(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your data");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address && role !== "STUDENT") {
      setRole("STUDENT");
      api.upsertUser({ walletAddress: address, role: "STUDENT" }).catch(() => {});
    }
    load();
  }, [address, role, setRole, load]);

  async function handleClaim(scholarship: Scholarship) {
    if (!address) return;
    setClaimingId(scholarship.id);
    setError(null);
    try {
      // Real flow: build+simulate `claim_scholarship` against the deployed
      // contract, then `await signTransaction(unsignedXdr)` with Freighter,
      // then submit to Soroban RPC and use the resulting hash below.
      const mockTxHash = `pending-${Date.now()}`;
      await api.claimScholarship(scholarship.id, address, mockTxHash);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaimingId(null);
    }
  }

  if (!address) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Student Dashboard</h1>
        <p className="mt-2 font-body text-ink/60">
          Connect your wallet to view assigned scholarships and credentials.
        </p>
        <button
          onClick={connect}
          className="mt-6 rounded-full bg-institution px-6 py-2.5 font-body font-semibold text-paper hover:bg-ink"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-ink">Student Dashboard</h1>
      <p className="mt-1 font-mono text-xs text-ink/50">{address}</p>
          <a href={`https://stellar.expert/explorer/testnet/account/${address}`} target="_blank" rel="noreferrer" className="text-xs text-institution hover:underline mt-1 inline-block">View on Explorer</a>

      {loading && <LoadingSpinner label="Loading your scholarships" />}
      {error && (
        <div className="my-4">
          <ErrorAlert message={error} onRetry={load} />
        </div>
      )}

      {!loading && (
        <>
          <section className="mt-10">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Assigned Scholarships
            </h2>
            {scholarships.length === 0 ? (
              <EmptyState
                title="No scholarships assigned yet"
                message="Once an institution assigns your wallet to a scholarship, it will appear here."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {scholarships.map((s) => {
                  const mine = s.assignments.find((a) => a.studentWallet === address);
                  return (
                    <ScholarshipCard
                      key={s.id}
                      scholarship={s}
                      onAction={() => handleClaim(s)}
                      actionLabel={mine?.claimed ? "Claimed ✓" : "Claim Scholarship"}
                      actionDisabled={mine?.claimed || claimingId === s.id}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-14">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Your Credentials
            </h2>
            {credentials.length === 0 ? (
              <EmptyState
                title="No credentials yet"
                message="Credentials appear here once an institution issues one after you claim a scholarship."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {credentials.map((c) => (
                  <CredentialCard key={c.id} credential={c} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-14 max-w-lg">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Give Feedback</h2>
            <FeedbackForm walletAddress={address} />
          </section>
        </>
      )}
    </div>
  );
}
