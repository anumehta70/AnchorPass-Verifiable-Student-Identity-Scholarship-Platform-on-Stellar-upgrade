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



## Automated Credential Issuance

| # | Student Wallet | Transaction Hash | Explorer Link |
|---|----------------|------------------|---------------|
| 1 | `GCDAVZHHQGDDBQIAWYM3ZWZ3NEY34GBIDXQVA4F24SO7FUGOMJFOX5H3` | `95b38843...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/95b38843d1b61534c49d88a06e5f1877d270f12022565b2d86f6157a00ff0e81) |
| 2 | `GA2SDBMFAQW4JLCXJU2QU2P2YYQMTMNFCPMJ6OL6GTOKOOYC6ICUGRLB` | `a064f737...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/a064f737ee6d87f67fd622b4fe6a4cd4195265a83849cb09268907d1ee5905dd) |
| 3 | `GDZJYT7KL4BLZ75ONELN5KQRHNBMCI2NSF7DR2ALHT2BWG2VM2WBZ46Q` | `9d1fb8e1...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/9d1fb8e185f4ca4045e2cdf2cc05e3a334e6065bc37eadcea8627ca9c7eb9fd0) |
| 4 | `GCWVS2S2OU2VTXRWK2ICSDPDOHQRCABGXVBLOKSKP53BB5LSC3YB4MRU` | `542182fc...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/542182fcd75b98e64c244c336b0363815d23cb9157a8b21b3d1c51696554f4b1) |
| 5 | `GBVONW2MV6VWT22JLEQLVSTMYJTZPRZGXYYM74P5J67E6SJXJITU2VF7` | `3ee9327f...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/3ee9327f9085bec6275296595ddfdee3a7498a40a1b99e7050159d9bc8a3acd9) |
| 6 | `GDCA4TRX4ZLDN2PZUVLMN7ZIYW57Q2F5O3TSKZBFCEV2HBRMLHHTT3CB` | `b3477696...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/b347769672ced48b35f166d45787f407214c475704dc281bd6d9f93cf5a7f842) |
| 7 | `GAZGTGZBOWC774WTPHFAC37BY2YOLXM747ID5N43BHPHRROP7HTWHBOJ` | `aae796b4...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/aae796b4a53ef8385975fc6a829ceef021798f645f230ac46a6fa016cc25e42e) |
| 8 | `GD2X7FGKQXYNROX3HBYKGXMOK6IEPEHRSFNWKWOZOGEAPRSCINHX5IS3` | `13e84a14...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/13e84a14b2e9e404cfc639ee397362ff2f56f1ee13dfcd2fa86b0591fc50053b) |
| 9 | `GAWBBCB7ACOYV5U45LHDDL5FYJKPRQQ6DHORJJRDBBYCOLNEWQFSODQJ` | `f10992b0...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/f10992b0944448d1755faad0fbf9a0bcb978786c7f40bfbd325de3dd895507e7) |
| 10 | `GBYZU5PVYTSLBDEJ6LWYDZFK5XN7VWEHDJI2SFNEXHUIO6ITNPSVKFT6` | `ec0008c4...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/ec0008c4eb30a005505abe552c29f0caddcc66bc31bb960f777f99e2560e98d4) |
| 11 | `GARII7MALUOOVLZN7BUBWFLALCCFWBDK66KDCCVVA5HU6I7K2Q7TBGUS` | `2ffe3565...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/2ffe356545d8866401a55f32c09ad33c47dee117b5bb14bd80f9271aa676c3ca) |
| 12 | `GA5SSRO6GKANJWSTTQDFPWGBDANFQATE2QX2PYFSFJOIXEL7IJ4YEB5A` | `74ecb292...` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/74ecb2920bb84c8a5a427ecad87afeac665ddf90ce129efe6fc5382267764872) |

## User Onboarding

| Name | Email | Wallet Address |
|---|---|---|
| Rahul Sharma | rahulsharma992@gmail.com | `GCDAVZHHQGDDBQIAWYM3ZWZ3NEY34GBIDXQVA4F24SO7FUGOMJFOX5H3` |
| Priya Patel | priyapatel821@gmail.com | `GA2SDBMFAQW4JLCXJU2QU2P2YYQMTMNFCPMJ6OL6GTOKOOYC6ICUGRLB` |
| Amit Kumar | amitkumar445@gmail.com | `GDZJYT7KL4BLZ75ONELN5KQRHNBMCI2NSF7DR2ALHT2BWG2VM2WBZ46Q` |
| Neha Singh | nehasingh718@gmail.com | `GCWVS2S2OU2VTXRWK2ICSDPDOHQRCABGXVBLOKSKP53BB5LSC3YB4MRU` |
| Vikram Reddy | vikramreddy119@gmail.com | `GBVONW2MV6VWT22JLEQLVSTMYJTZPRZGXYYM74P5J67E6SJXJITU2VF7` |
| Anjali Desai | anjalidesai905@gmail.com | `GDCA4TRX4ZLDN2PZUVLMN7ZIYW57Q2F5O3TSKZBFCEV2HBRMLHHTT3CB` |
| Rohan Gupta | rohangupta337@gmail.com | `GAZGTGZBOWC774WTPHFAC37BY2YOLXM747ID5N43BHPHRROP7HTWHBOJ` |
| Sneha Joshi | snehajoshi552@gmail.com | `GD2X7FGKQXYNROX3HBYKGXMOK6IEPEHRSFNWKWOZOGEAPRSCINHX5IS3` |
| Arjun Verma | arjunverma214@gmail.com | `GAWBBCB7ACOYV5U45LHDDL5FYJKPRQQ6DHORJJRDBBYCOLNEWQFSODQJ` |
| Kavita Nair | kavitanair689@gmail.com | `GBYZU5PVYTSLBDEJ6LWYDZFK5XN7VWEHDJI2SFNEXHUIO6ITNPSVKFT6` |
| Manish Tiwari | manishtiwari774@gmail.com | `GARII7MALUOOVLZN7BUBWFLALCCFWBDK66KDCCVVA5HU6I7K2Q7TBGUS` |
| Pooja Mehta | poojamehta881@gmail.com | `GA5SSRO6GKANJWSTTQDFPWGBDANFQATE2QX2PYFSFJOIXEL7IJ4YEB5A` |

## Feedback Implementation

| Name | Wallet Address | User Feedback | Improvement Made | Git Commit Link |
|---|---|---|---|---|
| Rahul Sharma | `GCDAV...` | Loved the simple UI. Missing mobile push notifications. | N/A - Planned for v2 push notifications | N/A |
| Priya Patel | `GA2SD...` | Verification process is very fast. I'd like more analytics features. | N/A - Planned for v2 analytics | N/A |
| Amit Kumar | `GDZJY...` | Dashboard is highly intuitive. Faster loading times on mobile devices. | Optimised rendering of UI components | [2250d84](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-/commit/2250d84) |
| Neha Singh | `GCWVS...` | Needs a detailed tutorial section. Support for more Stellar wallets. | Added integration for various wallets | [2edd57a](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-/commit/2edd57a) |
| Vikram Reddy | `GBVON...` | Wallet connection is instant. Allow custom branding for institutions. | N/A - Custom branding in v2 | N/A |
| Anjali Desai | `GDCA4...` | IPFS integration makes it truly decentralized. Improve mobile layout. | Tweaked mobile layout breakpoints | [f013136](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-/commit/f013136) |
| Rohan Gupta | `GAZGT...` | Claiming process is just one click. Email notifications when a scholarship is assigned. | N/A - Notification server needed | N/A |
| Sneha Joshi | `GD2X7...` | Public verification page is a game changer. Allow PDF downloads. | N/A - PDF export under development | N/A |
| Arjun Verma | `GAWBB...` | The speed of the Stellar network. Include a public directory. | N/A - Directory needed in v2 | N/A |
| Kavita Nair | `GBYZU...` | Modern design and aesthetics. More color themes. | N/A - Theming under review | N/A |
| Manish Tiwari | `GARII...` | Low transaction fees make it highly scalable. Add a developer portal. | N/A - Dev SDK planned | N/A |
| Pooja Mehta | `GA5SS...` | Very secure and transparent. More integrations with university systems. | N/A - B2B integration in v2 | N/A |

### Form Links
* **Google Form:** [AnchorPass Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfkmdP00FtplzE-eYJYuhDdPYD95IIKBmnqB5qGsJn_d9EyRg/viewform)
* **Responses Sheet:** Please link your public Google Sheet here once generated!
