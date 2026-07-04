import { useState, type FormEvent } from "react";
import { useWallet } from "../hooks/useWallet.tsx";
import { api, type Scholarship } from "../lib/api.ts";
import { ErrorAlert } from "./ErrorAlert.tsx";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { prepareContractCall, preparePayment, submitContractTx } from "../lib/soroban";

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
  const [success, setSuccess] = useState<{ id: string; qrCode?: string; txHash?: string; paymentTxHash?: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Step 0: Prepare IPFS metadata
      const { ipfsHash } = await api.prepareCredential({
        studentWallet,
        institutionWallet,
        institutionName: "Your Institution",
        credentialTitle,
        scholarshipId: scholarship.id,
      });

      // Step 1: Soroban contract call — issue_credential
      const unsignedXdr = await prepareContractCall(
        institutionWallet,
        "issue_credential",
        [
          nativeToScVal(institutionWallet, { type: "address" }),
          nativeToScVal(studentWallet, { type: "address" }),
          nativeToScVal(credentialTitle, { type: "string" }),
          nativeToScVal(ipfsHash, { type: "string" }),
        ],
      );

      const signedXdr = await _signTransaction(unsignedXdr);
      const txHash = await submitContractTx(signedXdr);

      // Step 2: Classic XLM payment to the student (separate transaction)
      let paymentTxHash: string | undefined;
      const xlmAmount = scholarship.amount;
      if (xlmAmount && Number(xlmAmount) > 0) {
        try {
          const paymentXdr = await preparePayment(institutionWallet, studentWallet, xlmAmount);
          const signedPaymentXdr = await _signTransaction(paymentXdr);
          paymentTxHash = await submitContractTx(signedPaymentXdr);
        } catch (payErr) {
          // Payment failed but credential was already issued on-chain
          console.warn("XLM payment failed (credential still issued):", payErr);
        }
      }

      // Step 3: Record in database
      const mockContractCredentialId = String(Date.now());
      const credential = await api.finalizeCredential({
        contractCredentialId: mockContractCredentialId,
        transactionHash: txHash,
        title: credentialTitle,
        studentWallet,
        institutionWallet,
        ipfsHash,
      });

      setSuccess({ id: credential.id, qrCode: credential.qrCode, txHash, paymentTxHash });
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
            <p className="font-body text-sm text-verified">Credential issued on-chain successfully!</p>
            {success.txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${success.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-mono text-xs text-institution hover:underline"
              >
                🔗 Credential Tx on Stellar Expert ↗
              </a>
            )}
            {success.paymentTxHash && (
              <>
                <br />
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${success.paymentTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-mono text-xs text-verified hover:underline"
                >
                  💰 XLM Payment Tx on Stellar Expert ↗
                </a>
              </>
            )}
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
