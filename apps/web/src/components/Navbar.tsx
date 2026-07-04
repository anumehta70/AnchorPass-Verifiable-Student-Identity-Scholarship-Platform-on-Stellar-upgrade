import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { WalletConnectButton } from "./WalletConnectButton.tsx";
import { MobileSidebar } from "./MobileSidebar.tsx";

const LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/institutions", label: "For Institutions" },
  { to: "/students", label: "For Students" },
  { to: "/verify", label: "Verify Credential" },
  { to: "/directory", label: "Public Directory" },
  { to: "#", label: "Community Forum" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-seal text-seal">
            ⚓
          </span>
          AnchorPass
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm transition hover:text-institution ${
                location.pathname === link.to ? "text-institution font-semibold" : "text-ink/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => {
              document.documentElement.classList.toggle("dark");
              localStorage.setItem(
                "theme",
                document.documentElement.classList.contains("dark") ? "dark" : "light"
              );
            }}
            className="rounded-full p-2 hover:bg-ink/5"
            aria-label="Toggle dark mode"
          >
            🌓
          </button>
          <WalletConnectButton />
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/15 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} links={LINKS} />
    </header>
  );
}
