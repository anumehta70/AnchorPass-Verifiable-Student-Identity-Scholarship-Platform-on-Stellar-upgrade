# AnchorPass — Architecture

## Overview

AnchorPass is a three-layer system: a React frontend, a Node.js API, and a
Soroban smart contract on the Stellar Testnet. The contract is the source of
truth for all trust-critical state. The database and IPFS are performance and
UX layers on top of it.

```
Browser (React + Freighter)
    │
    ├── Signs transactions locally — private keys never leave the user's device
    │
    ├──► Soroban RPC (Stellar Testnet)
    │        Stores: institution registrations, scholarship state,
    │                claim records, credential hashes, credential status
    │
    └──► AnchorPass API (Express + Postgres)
             Stores: human-readable metadata, IPFS CIDs, tx hashes,
                     feedback, analytics, 10-user proof table
                 │
                 └──► Pinata / IPFS
                          Stores: certificate metadata JSON
                          (only the content hash is written on-chain)
```

## Trust model

The contract enforces all access control:
- Only registered institution wallets can create scholarships or issue credentials.
- Only the owning institution can revoke its own credentials.
- Only assigned students can claim a scholarship.
- Claim deadline is checked against `env.ledger().timestamp()` — it cannot be bypassed.

The backend is never trusted for anything that affects the chain. It records
transaction hashes that the frontend reports back after successful submissions,
and its Postgres copy is used for fast listing/search — not for verification.
Verification always reads from the contract.

## Data split

| Data | Where |
|---|---|
| Credential status (valid / revoked) | Soroban contract |
| Credential content hash | Soroban contract |
| Institution & scholarship state | Soroban contract |
| Claim records | Soroban contract |
| Full certificate metadata JSON | IPFS (Pinata) |
| Human-readable listings / search | Postgres |
| Transaction hashes (for UI) | Postgres |
| Feedback & analytics | Postgres |

## Why Stellar

- Soroban smart contracts in Rust compile to WASM and run on the Stellar
  ledger, with deterministic execution and low fees.
- Stellar handles fast, cheap cross-border payments natively — future USDC
  scholarship disbursement is a natural extension, not a rebuild.
- Freighter wallet gives a familiar browser-extension UX (like MetaMask for
  Ethereum users).
- The Testnet has full parity with Mainnet, so the demo is production-ready.
