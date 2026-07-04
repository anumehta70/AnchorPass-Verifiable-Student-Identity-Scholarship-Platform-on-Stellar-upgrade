import type { Scholarship } from "../lib/api.ts";

interface Props {
  scholarship: Scholarship;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionDisabled?: boolean;
}

export function ScholarshipCard({
  scholarship,
  onAction,
  actionLabel,
  actionDisabled,
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionDisabled,
}: Props) {
  const claimedCount = scholarship.assignments.filter((a) => a.claimed).length;
  const seatsLeft = scholarship.totalSeats - scholarship.assignments.length;
  const deadline = new Date(scholarship.deadline);
  const isExpired = deadline.getTime() < Date.now();

  return (
    <div className="flex flex-col justify-between rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">
            {scholarship.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
              isExpired
                ? "bg-revoked/10 text-revoked"
                : scholarship.status === "OPEN"
                  ? "bg-verified/10 text-verified"
                  : "bg-ink/10 text-ink/60"
            }`}
          >
            {isExpired ? "Expired" : scholarship.status}
          </span>
        </div>

        {scholarship.description && (
          <p className="mb-4 line-clamp-2 font-body text-sm text-ink/60">
            {scholarship.description}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-y-2 font-body text-sm">
          <dt className="text-ink/50">Amount</dt>
          <dd className="text-right font-mono font-medium">{scholarship.amount} XLM</dd>

          <dt className="text-ink/50">Seats</dt>
          <dd className="text-right font-mono">
            {claimedCount}/{scholarship.totalSeats} claimed
          </dd>

          <dt className="text-ink/50">Deadline</dt>
          <dd className="text-right font-mono">{deadline.toLocaleDateString()}</dd>
        </dl>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            disabled={secondaryActionDisabled || seatsLeft <= 0 || isExpired}
            className="w-full rounded-lg bg-ink/5 py-2.5 font-body text-sm font-semibold text-ink transition hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {secondaryActionLabel ?? "Assign"}
          </button>
        )}
        {onAction && (
          <button
            onClick={onAction}
            disabled={actionDisabled || seatsLeft <= 0 || isExpired}
            className="w-full rounded-lg bg-institution py-2.5 font-body text-sm font-semibold text-paper transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLabel ?? "View"}
          </button>
        )}
      </div>
    </div>
  );
}
