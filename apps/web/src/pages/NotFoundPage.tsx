import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-mono text-6xl font-semibold text-ink/10">404</span>
      <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="font-body text-sm text-ink/60">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-institution px-5 py-2 font-body text-sm font-semibold text-paper hover:bg-ink"
      >
        Go home
      </Link>
    </div>
  );
}
