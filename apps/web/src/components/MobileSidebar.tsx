import { Link } from "react-router-dom";
import { WalletConnectButton } from "./WalletConnectButton.tsx";

interface Props {
  open: boolean;
  onClose: () => void;
  links: { to: string; label: string }[];
}

export function MobileSidebar({ open, onClose, links }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-0 h-full w-72 bg-paper p-6 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg font-semibold">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink/15"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-5">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="font-body text-base text-ink/80 hover:text-institution"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <WalletConnectButton />
        </div>
      </div>
    </div>
  );
}
