interface Props {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink/70">{title}</p>
      <p className="max-w-sm font-body text-sm text-ink/50">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 rounded-full bg-institution px-5 py-2 font-body text-sm font-semibold text-paper hover:bg-ink"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
