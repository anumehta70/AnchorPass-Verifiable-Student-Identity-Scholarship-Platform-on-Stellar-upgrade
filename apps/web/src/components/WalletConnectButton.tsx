import { useWallet } from "../hooks/useWallet.tsx";

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, isConnecting, connect, disconnect } = useWallet();

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="group flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 font-mono text-sm text-ink transition hover:border-revoked/40 hover:text-revoked"
      >
        <span className="h-2 w-2 rounded-full bg-verified" />
        {truncate(address)}
        <span className="hidden group-hover:inline">Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="rounded-full bg-institution px-5 py-2 font-body text-sm font-semibold text-paper transition hover:bg-ink disabled:opacity-60"
    >
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
