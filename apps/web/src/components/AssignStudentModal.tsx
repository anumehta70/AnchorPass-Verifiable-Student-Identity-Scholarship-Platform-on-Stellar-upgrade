import { useState, type FormEvent } from "react";
import { api, type Scholarship } from "../lib/api.ts";
import { ErrorAlert } from "./ErrorAlert.tsx";

interface Props {
  scholarship: Scholarship;
  onClose: () => void;
}

export function AssignStudentModal({ scholarship, onClose }: Props) {
  const [studentWallet, setStudentWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!studentWallet || studentWallet.length < 20) {
      setError("Please enter a valid Stellar wallet address");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.assignStudent(scholarship.id, studentWallet);
      onClose(); // Automatically refresh happens in the parent component
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign student");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Assign Student</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>

        <p className="mb-4 font-body text-sm text-ink/60">
          Assign a student's wallet to <strong>{scholarship.title}</strong> so they can claim it from their dashboard.
        </p>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 font-body text-sm font-medium text-ink">
            Student Wallet Address
            <input
              required
              type="text"
              value={studentWallet}
              onChange={(e) => setStudentWallet(e.target.value)}
              placeholder="G..."
              className="rounded-lg border border-ink/20 bg-transparent px-4 py-2.5 font-mono text-ink placeholder:text-ink/30 focus:border-institution focus:outline-none"
            />
          </label>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-ink/5 py-2.5 font-body font-semibold text-ink transition hover:bg-ink/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-institution py-2.5 font-body font-semibold text-paper transition hover:bg-ink disabled:opacity-50"
            >
              {submitting ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
