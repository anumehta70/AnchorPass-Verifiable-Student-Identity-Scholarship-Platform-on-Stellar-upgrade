interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-revoked/30 bg-revoked/5 p-4">
      <span className="mt-0.5 text-revoked">⚠</span>
      <div className="flex-1">
        <p className="font-body text-sm text-revoked">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 font-body text-sm font-semibold text-revoked underline underline-offset-2"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
