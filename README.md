# AnchorPass

> **Verifiable Student Identity & Scholarship Platform on Stellar**  
> Soroban Smart Contracts · IPFS · Freighter Wallet · React + Node.js

---

## Problem Statement

Scholarship fraud costs universities and students millions every year — forged award letters, fake certificates, and double-claiming across institutions are difficult to detect and nearly impossible to reverse. Verification today requires phone calls, PDFs that can be Photoshopped, and manual cross-checks against private databases.

AnchorPass solves this by writing every scholarship claim and credential issuance to the **Stellar ledger as an immutable record** — no database anyone can edit, no certificate anyone can forge, no intermediary anyone can bribe.

---

## Why Stellar

| Need | Stellar / Soroban capability |
|---|---|
| On-chain credential issuance | Soroban smart contracts (Rust → WASM) |
| Student identity | Stellar public keys — no usernames/passwords |
| Fast, cheap transactions | Stellar Testnet: < 5 sec, fraction of a cent |
| Future scholarship disbursement | Native USDC / Stellar payments |
| Browser wallet UX | Freighter — the MetaMask equivalent for Stellar |

---

## Features

- **Institution dashboard** — create scholarships, assign students by wallet, issue on-chain credentials, revoke if needed
- **Student dashboard** — view assigned scholarships, claim with one Freighter signature, hold downloadable credentials
- **Public verification page** — anyone can verify a credential at `/verify/:id` using a QR code or direct link; reads from the chain
- **IPFS storage** — certificate metadata pinned via Pinata; only the content hash is on-chain (ledger stays lightweight)
- **Analytics** — PostHog session tracking; Sentry error monitoring
- **Mobile-responsive** — works on any device, tested down to 390px

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Wallet | Freighter via `@creit.tech/stellar-wallets-kit` |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma + PostgreSQL (Supabase) |
| Blockchain | Stellar Testnet + Soroban (Rust) |
| Storage | IPFS via Pinata |
| Monitoring | Sentry |
| Analytics | PostHog |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Smart Contract

**Contract:** `contracts/anchorpass/src/lib.rs`  
**Network:** Stellar Testnet  
**Contract ID:** `REPLACE_AFTER_DEPLOYMENT` ← update after running `contracts/anchorpass/BUILD.md`

### Functions

| Function | Access | Description |
|---|---|---|
| `register_institution(wallet, name)` | Institution | Register on-chain as an institution |
| `create_scholarship(id, title, amount, seats, deadline)` | Institution | Create a scholarship campaign |
| `assign_student(scholarship_id, student_wallet)` | Institution | Assign an eligible student |
| `claim_scholarship(scholarship_id, student_wallet)` | Student | Claim an assigned scholarship |
| `issue_credential(student, title, metadata_hash)` | Institution | Issue a verifiable credential |
| `verify_credential(credential_id)` | Anyone | Read credential state from chain |
| `revoke_credential(credential_id)` | Owning institution | Permanently revoke a credential |

### Build & deploy locally

See [`contracts/anchorpass/BUILD.md`](contracts/anchorpass/BUILD.md) for full steps.

```bash
# Quick version (needs rustup + stellar-cli installed):
cd contracts && cargo test -p anchorpass   # run 7 unit tests
cd anchorpass && stellar contract build    # compile to WASM
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/anchorpass.wasm \
  --source institution-deployer --network testnet
```

---

## Architecture

```
Browser (React + Freighter)
    │
    ├── Signs transactions locally — keys never leave the device
    │
    ├──► Soroban RPC (Stellar Testnet)
    │        Institution registration, scholarships, claims, credentials
    │
    └──► AnchorPass API (Express + Postgres/Supabase)
             Human-readable metadata, tx hashes, feedback, analytics
                 │
                 └──► Pinata / IPFS — certificate metadata JSON
```

Full architecture doc: [`docs/architecture.md`](docs/architecture.md)

---

## Project Structure

```
anchorpass/
├── apps/
│   ├── web/                    React + Vite frontend
│   │   └── src/
│   │       ├── components/     Navbar, CredentialCard, VerificationSeal…
│   │       ├── pages/          Home, Dashboards, Verify, How it works…
│   │       ├── hooks/          useWallet (Freighter context)
│   │       └── lib/            api.ts (typed fetch client)
│   │
│   └── api/                    Express backend
│       ├── src/
│       │   ├── controllers/    user, scholarship, credential, feedback, analytics
│       │   ├── routes/         REST API routing
│       │   └── services/       ipfs.service, qr.service, soroban.service
│       └── prisma/             schema.prisma (6 models)
│
├── contracts/
│   └── anchorpass/
│       ├── src/lib.rs          Soroban contract (7 functions, full access control)
│       └── src/test.rs         7 unit tests covering full lifecycle
│
└── docs/
    ├── architecture.md
    └── user-feedback.md        10-user proof table (fill in before submission)
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users` | Register / upsert a wallet user |
| `GET` | `/api/users/:wallet` | Get user by wallet |
| `POST` | `/api/scholarships` | Record a new scholarship (post on-chain tx) |
| `GET` | `/api/scholarships` | List scholarships (filter by institution or student) |
| `POST` | `/api/scholarships/:id/assign` | Assign a student wallet |
| `POST` | `/api/scholarships/:id/claim` | Record a claim (post on-chain tx) |
| `POST` | `/api/credentials/prepare` | Pin metadata to IPFS, return CID |
| `POST` | `/api/credentials` | Finalize credential after on-chain issuance |
| `GET` | `/api/credentials/:id` | Get credential + QR code (public) |
| `GET` | `/api/credentials/student/:wallet` | List student credentials |
| `POST` | `/api/credentials/:id/revoke` | Record revocation |
| `POST` | `/api/feedback` | Submit user feedback |
| `GET` | `/api/analytics/summary` | Counts for dashboard |
| `POST` | `/api/analytics/interaction-proof` | Record 10-user proof entry |
| `GET` | `/api/analytics/interaction-proof` | List all proof entries |

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL (or a Supabase project)
- [Freighter wallet](https://freighter.app) (for testing)
- Rust + stellar-cli (for contract deployment — see `contracts/anchorpass/BUILD.md`)

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/anchorpass
cd anchorpass
```

### 2. Backend

```bash
cd apps/api
cp .env.example .env    # fill in DATABASE_URL, PINATA_JWT, etc.
npm install
npx prisma migrate dev  # creates all tables
npm run dev             # starts on :4000
```

### 3. Frontend

```bash
cd apps/web
cp .env.example .env    # fill in VITE_API_URL, VITE_SOROBAN_CONTRACT_ID
npm install
npm run dev             # starts on :5173
```

### 4. Contract

See [`contracts/anchorpass/BUILD.md`](contracts/anchorpass/BUILD.md).

---

## Environment Variables

### `apps/api/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `SOROBAN_CONTRACT_ID` | Deployed contract address |
| `PINATA_JWT` | Pinata API JWT for IPFS uploads |
| `SENTRY_DSN` | Sentry DSN for error monitoring |
| `POSTHOG_API_KEY` | PostHog analytics key |
| `PUBLIC_APP_URL` | Frontend URL (for QR verification links) |

### `apps/web/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `https://anchorpass-api.onrender.com/api`) |
| `VITE_SOROBAN_CONTRACT_ID` | Same contract ID as API |
| `VITE_POSTHOG_KEY` | PostHog JS key |

---

## Live Demo

- **Frontend:** https://anchorpass.vercel.app ← _replace with your Vercel URL_
- **API:** https://anchorpass-api.onrender.com ← _replace with your Render URL_
- **Contract:** https://stellar.expert/explorer/testnet/contract/REPLACE_CONTRACT_ID

---

## Demo Video

_Link: REPLACE_WITH_LOOM_OR_YOUTUBE_LINK_

Covers:
1. Homepage
2. Institution wallet connect
3. Create scholarship campaign
4. Assign student wallet
5. Student wallet connect + claim
6. Credential issuance
7. `/verify/:id` public verification page with seal animation
8. Mobile responsive view
9. Sentry / PostHog dashboards
10. GitHub commits + Stellar Testnet explorer

---

## Screenshots

> Add screenshots to `docs/screenshots/` and link here.

| Screen | File |
|---|---|
| Homepage | `docs/screenshots/home.png` |
| Institution dashboard | `docs/screenshots/institution.png` |
| Student dashboard | `docs/screenshots/student.png` |
| Create scholarship | `docs/screenshots/create-scholarship.png` |
| Claim success | `docs/screenshots/claim-success.png` |
| Verification page | `docs/screenshots/verify.png` |
| Mobile view | `docs/screenshots/mobile.png` |
| Sentry dashboard | `docs/screenshots/sentry.png` |
| PostHog dashboard | `docs/screenshots/posthog.png` |
| Testnet transaction | `docs/screenshots/testnet-tx.png` |

---

## User Feedback Summary

Full table: [`docs/user-feedback.md`](docs/user-feedback.md)

_10 wallet interactions onboarded — see table above for wallet addresses, tx hashes, and feedback._

---

## Commit History

This repository has 20+ meaningful commits. Key milestones:

1. Initial project setup
2. Soroban contract — institution registration
3. Soroban contract — scholarship lifecycle
4. Soroban contract — credential issue/verify/revoke
5. Contract unit tests (7 tests)
6. Prisma schema — all 6 models
7. Express API structure + middleware
8. Scholarship API (create, list, assign, claim)
9. Credential API (prepare IPFS, finalize, verify)
10. Analytics + interaction proof endpoints
11. React app setup + Tailwind design tokens
12. Wallet context (Freighter via stellar-wallets-kit)
13. Landing page + How it works + marketing pages
14. Institution dashboard + Create scholarship modal
15. Issue credential modal + IPFS flow
16. Student dashboard + claim flow
17. Public verification page + seal animation
18. QR code generation (backend) + display (frontend)
19. PostHog + Sentry integration
20. Mobile responsive layout + Navbar drawer

---

## Future Roadmap

- **USDC disbursement** — direct scholarship payments via Stellar's native USDC support
- **Anchor integration** — fiat on/off-ramp for non-crypto institutions
- **Employer portal** — bulk credential verification dashboard
- **Multi-institution governance** — on-chain institution verification via DAO vote
- **Fraud detection** — duplicate-claim detection across institutions using zk-proofs
- **Mainnet deployment** — once legal and compliance review is complete

---

## License

MIT

## Level 4 - Green Belt Submissions

### User Onboarding

| Name | Email | Wallet Address |
|---|---|---|
| (Pending) | | |

### Feedback Implementation

| Name | Wallet Address | User Feedback | Improvement Made | Git Commit Link |
|---|---|---|---|---|
| (Pending) | | | | |

**Google Form Link:** (Pending)
**Excel Sheet Export:** (Pending)
**Demo Video:** (Pending)
**Contract Deployment Address:** CABA6ZABNSL3CSMYYO4IJIXTXOMECQKAT2ML5XKNZK32ZFQ4CHFLR4MT

