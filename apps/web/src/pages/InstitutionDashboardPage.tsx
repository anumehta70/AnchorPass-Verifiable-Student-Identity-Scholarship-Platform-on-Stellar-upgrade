import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../hooks/useWallet.tsx";
import { api, type Scholarship } from "../lib/api.ts";
import { ScholarshipCard } from "../components/ScholarshipCard.tsx";
import { LoadingSpinner } from "../components/LoadingSpinner.tsx";
import { ErrorAlert } from "../components/ErrorAlert.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { CreateScholarshipModal } from "../components/CreateScholarshipModal.tsx";
import { IssueCredentialModal } from "../components/IssueCredentialModal.tsx";
import { AssignStudentModal } from "../components/AssignStudentModal.tsx";

export function InstitutionDashboardPage() {
  const { address, connect, role, setRole } = useWallet();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [issueFor, setIssueFor] = useState<Scholarship | null>(null);
  const [assignFor, setAssignFor] = useState<Scholarship | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listScholarships({ institutionWallet: address });
      setScholarships(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address && role !== "INSTITUTION") {
      setRole("INSTITUTION");
      api.upsertUser({ walletAddress: address, role: "INSTITUTION" }).catch(() => {});
    }
    load();
  }, [address, role, setRole, load]);

  if (!address) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Institution Dashboard</h1>
        <p className="mt-2 font-body text-ink/60">Connect your wallet to manage scholarships.</p>
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
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Institution Dashboard</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">{address}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-full bg-institution px-5 py-2.5 font-body text-sm font-semibold text-paper hover:bg-ink"
        >
          + Create Scholarship
        </button>
      </div>

      {loading && <LoadingSpinner label="Loading scholarships" />}
      {error && <ErrorAlert message={error} onRetry={load} />}

      {!loading && !error && scholarships.length === 0 && (
        <EmptyState
          title="No scholarships yet"
          message="Create your first scholarship campaign to start assigning students and issuing credentials."
          action={{ label: "Create Scholarship", onClick: () => setShowCreate(true) }}
        />
      )}

      {!loading && !error && scholarships.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((s) => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              onAction={() => setIssueFor(s)}
              actionLabel="Issue Credential"
              onSecondaryAction={() => setAssignFor(s)}
              secondaryActionLabel="Assign Student"
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateScholarshipModal
          institutionWallet={address}
          onClose={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {issueFor && (
        <IssueCredentialModal
          scholarship={issueFor}
          institutionWallet={address}
          onClose={() => {
            setIssueFor(null);
            load();
          }}
        />
      )}

      {assignFor && (
        <AssignStudentModal
          scholarship={assignFor}
          onClose={() => {
            setAssignFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}
