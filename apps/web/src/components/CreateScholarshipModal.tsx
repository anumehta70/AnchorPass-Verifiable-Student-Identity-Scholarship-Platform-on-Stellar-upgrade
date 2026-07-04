import { useState, type FormEvent } from "react";
import { useWallet } from "../hooks/useWallet.tsx";
import { api } from "../lib/api.ts";
import { ErrorAlert } from "./ErrorAlert.tsx";
import { nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { prepareContractCall, submitContractTx } from "../lib/soroban";
import type { ReactNode } from "react";

interface Props {
  institutionWallet: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateScholarshipModal({ institutionWallet, onClose, onCreated }: Props) {
  const { signTransaction: _signTransaction } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [totalSeats, setTotalSeats] = useState("5");
  const [deadline, setDeadline] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const deadlineSecs = BigInt(Math.floor(new Date(deadline).getTime() / 1000));
      const amountVal = BigInt(Math.floor(parseFloat(amount) * 1e7));

      // Build i128 manually — nativeToScVal mishandles i128/u64 types
      const i128Val = xdr.ScVal.scvI128(
        new xdr.Int128Parts({
          lo: new xdr.Uint64(amountVal & BigInt("0xFFFFFFFFFFFFFFFF")),
          hi: new xdr.Int64(amountVal >> BigInt(64)),
        })
      );
      const u64Val = xdr.ScVal.scvU64(new xdr.Uint64(deadlineSecs));

      const unsignedXdr = await prepareContractCall(
        institutionWallet,
        "create_scholarship",
        [
          nativeToScVal(institutionWallet, { type: "address" }),
          nativeToScVal(title, { type: "string" }),
          i128Val,
          nativeToScVal(Number(totalSeats), { type: "u32" }),
          u64Val,
        ]
      );

      // 2. Have the wallet sign it
      const signedXdr = await _signTransaction(unsignedXdr);

      // 3. Submit to Soroban RPC
      const txHash = await submitContractTx(signedXdr);

      // For the demo frontend, we use the timestamp as the ID since the exact
      // returned u64 ID is hard to parse from the RPC response without full bindings.
      const mockContractScholarshipId = String(Date.now());

      await api.createScholarship({
        contractScholarshipId: mockContractScholarshipId,
        transactionHash: txHash,
        title,
        description: description || undefined,
        amount,
        totalSeats: Number(totalSeats),
        deadline: new Date(deadline).toISOString(),
        eligibility: eligibility || undefined,
        institutionWallet,
      });

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create scholarship");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Create Scholarship</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Scholarship Name">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input h-20"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (XLM)">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Total Seats">
              <input
                required
                type="number"
                min="1"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Deadline">
            <input
              required
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Eligibility">
            <input
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="input"
              placeholder="e.g. Full-time undergraduate, GPA 3.5+"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-institution py-2.5 font-body text-sm font-semibold text-paper hover:bg-ink disabled:opacity-60"
          >
            {submitting ? "Creating on-chain…" : "Create Scholarship"}
          </button>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(11,14,20,0.15);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-family: Inter, sans-serif;
          font-size: 0.875rem;
        }
        .input:focus { outline: 2px solid #C9A227; border-color: transparent; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}
