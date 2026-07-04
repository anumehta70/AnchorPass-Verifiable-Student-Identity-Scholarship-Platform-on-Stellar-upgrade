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
import { prepareContractCall, submitContractTx } from "../lib/soroban.ts";
import { nativeToScVal } from "@stellar/stellar-sdk";

export function InstitutionDashboardPage() {
  const { address, connect, role, setRole, signTransaction } = useWallet();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [issueFor, setIssueFor] = useState<Scholarship | null>(null);
  const [assignFor, setAssignFor] = useState<Scholarship | null>(null);
  const [registering, setRegistering] = useState(false);

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

  async function handleRegister() {
    if (!address) return;
    setRegistering(true);
    setError(null);
    try {
      const unsignedXdr = await prepareContractCall(address, "register_institution", [
        nativeToScVal(address, { type: "address" }),
        nativeToScVal("My Institution", { type: "string" }),
      ]);
      const signedXdr = await signTransaction(unsignedXdr);
      await submitContractTx(signedXdr);
      alert("Successfully registered on-chain!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register on-chain");
    } finally {
      setRegistering(false);
    }
  }

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
        <div className="flex gap-3">
          <button
            onClick={handleRegister}
            disabled={registering}
            className="rounded-full border border-institution text-institution px-5 py-2.5 font-body text-sm font-semibold hover:bg-institution/10 disabled:opacity-50"
          >
            {registering ? "Registering..." : "Register on Blockchain"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-full bg-institution px-5 py-2.5 font-body text-sm font-semibold text-paper hover:bg-ink"
          >
            + Create Scholarship
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
          <p className="text-sm font-body text-ink/60">Active Scholarships</p>
          <p className="mt-1 font-display text-3xl font-semibold text-institution">
            {scholarships.length}
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
          <p className="text-sm font-body text-ink/60">Total Seats Available</p>
          <p className="mt-1 font-display text-3xl font-semibold text-institution">
            {scholarships.reduce((acc, s) => acc + s.totalSeats, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
          <p className="text-sm font-body text-ink/60">Total Budget Managed</p>
          <p className="mt-1 font-display text-3xl font-semibold text-institution">
            {scholarships.reduce((acc, s) => acc + s.amount, 0).toLocaleString()} XLM
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-ink/5 p-5 border border-ink/10">
        <h3 className="font-display font-semibold text-ink">Quick Tutorial</h3>
        <p className="mt-2 font-body text-sm text-ink/70 leading-relaxed">
          1. <strong>Register</strong> your institution on the blockchain first.<br/>
          2. <strong>Create</strong> a new Scholarship Campaign.<br/>
          3. <strong>Assign</strong> students using their Stellar wallet address.<br/>
          4. Once assigned, you can <strong>Issue</strong> verifiable credentials directly to their wallets.
        </p>
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
          onCreated={() => {
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
