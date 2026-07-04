/**
 * Thin read-layer over the Soroban RPC endpoint.
 *
 * IMPORTANT: state-mutating calls (claim_scholarship, issue_credential, etc.)
 * are signed client-side by the user's Freighter wallet and submitted
 * directly from the frontend — the backend never holds a private key or
 * signs on anyone's behalf. This service is only for:
 *   1. Reading contract state to cross-check what's stored in Postgres
 *   2. Recording a transaction hash that the frontend reports back after
 *      a successful client-signed submission
 *
 * Requires `@stellar/stellar-sdk` to be installed (see package.json).
 * The actual RPC calls are stubbed with clear TODOs since wiring this up
 * requires a live deployed contract ID, which only exists after you run
 * `contracts/anchorpass/BUILD.md` locally and deploy to Testnet.
 */

interface ContractCallResult<T> {
  result: T;
  latestLedger: number;
}

const RPC_URL = process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID ?? "";

export async function verifyCredentialOnChain(
  credentialId: string
): Promise<ContractCallResult<Record<string, unknown>> | null> {
  if (!CONTRACT_ID) {
    console.warn("[soroban] SOROBAN_CONTRACT_ID not set — skipping on-chain read");
    return null;
  }

  // TODO once deployed: use @stellar/stellar-sdk's Server/rpc.Server to
  // simulate a `verify_credential` invocation against CONTRACT_ID and
  // decode the returned XDR into a plain object matching the Rust
  // `Credential` struct (id, institution, student, title, metadata_hash,
  // issued_at, status).
  //
  // Example shape once implemented:
  //   const server = new rpc.Server(RPC_URL);
  //   const contract = new Contract(CONTRACT_ID);
  //   const tx = ...build + simulate...
  //   return { result: decoded, latestLedger: sim.latestLedger };

  throw new Error(
    "verifyCredentialOnChain is a stub — wire up @stellar/stellar-sdk once the contract is deployed (see contracts/anchorpass/BUILD.md)"
  );
}

export function isContractConfigured(): boolean {
  return Boolean(CONTRACT_ID);
}
