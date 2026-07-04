import { useState, type FormEvent } from "react";
import { useWallet } from "../hooks/useWallet.tsx";
import { api, type Scholarship } from "../lib/api.ts";
import { ErrorAlert } from "./ErrorAlert.tsx";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { prepareContractCall, submitContractTx } from "../lib/soroban";

interface Props {
  scholarship: Scholarship;
  institutionWallet: string;
  onClose: () => void;
}

export function IssueCredentialModal({ scholarship, institutionWallet, onClose }: Props) {
  const { signTransaction: _signTransaction } = useWallet();
  const claimedStudents = scholarship.assignments.filter((a) => a.claimed);
  const [studentWallet, setStudentWallet] = useState(claimedStudents[0]?.studentWallet ?? "");
  const [credentialTitle, setCredentialTitle] = useState(`${scholarship.title} — Certificate`);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; qrCode?: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { ipfsHash } = await api.prepareCredential({
        studentWallet,
        institutionWallet,
        institutionName: "Your Institution",
        credentialTitle,
        scholarshipId: scholarship.id,
      });

      // 1. Build the Soroban XDR for `issue_credential`
      const unsignedXdr = await prepareContractCall(
        institutionWallet,
        "issue_credential",
        [
          nativeToScVal(institutionWallet, { type: "address" }),
          nativeToScVal(studentWallet, { type: "address" }),
          nativeToScVal(Number(scholarship.id), { type: "u64" }),
          nativeToScVal(ipfsHash, { type: "string" }),
        ]
      );

      // 2. Have the wallet sign it
      const signedXdr = await _signTransaction(unsignedXdr);

      // 3. Submit to Soroban RPC
      const txHash = await submitContractTx(signedXdr);

      // We use the timestamp as the credential ID mock since the exact u64
      // return isn't easy to unpack without full TS bindings right now.
      const mockContractCredentialId = String(Date.now());

      const credential = await api.finalizeCredential({
        contractCredentialId: mockContractCredentialId,
        transactionHash: txHash,
        title: credentialTitle,
        studentWallet,
        institutionWallet,
        ipfsHash,
      });

      setSuccess({ id: credential.id, qrCode: credential.qrCode });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue credential");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Issue Credential</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        {success ? (
          <div className="text-center">
            <p className="font-body text-sm text-verified">Credential issued successfully.</p>
            {success.qrCode && (
              <img src={success.qrCode} alt="Verification QR code" className="mx-auto mt-4 h-40 w-40" />
            )}
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-institution py-2.5 font-body text-sm font-semibold text-paper hover:bg-ink"
            >
              Done
            </button>
          </div>
        ) : claimedStudents.length === 0 ? (
          <p className="font-body text-sm text-ink/60">
            No students have claimed this scholarship yet. Credentials can only be issued to
            students who have completed a claim.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-body text-sm font-medium text-ink/70">
                Student
              </span>
              <select
                value={studentWallet}
                onChange={(e) => setStudentWallet(e.target.value)}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 font-mono text-xs"
              >
                {claimedStudents.map((s) => (
                  <option key={s.studentWallet} value={s.studentWallet}>
                    {s.studentWallet}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-body text-sm font-medium text-ink/70">
                Credential Title
              </span>
              <input
                value={credentialTitle}
                onChange={(e) => setCredentialTitle(e.target.value)}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 font-body text-sm"
                required
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-institution py-2.5 font-body text-sm font-semibold text-paper hover:bg-ink disabled:opacity-60"
            >
              {submitting ? "Issuing…" : "Issue Credential"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
