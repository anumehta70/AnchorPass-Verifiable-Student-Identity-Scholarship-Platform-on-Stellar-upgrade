# AnchorPass — Verifiable Student Identity (Level 4 Submission)

A production-ready verifiable credentials platform built on the Stellar network. Institutions issue on-chain scholarship credentials, and students claim them with zero fees. The public can cryptographically verify any credential in seconds without relying on a centralized database.

---

## 🚀 Live Links
- **Live MVP (Frontend):** [https://anchorpass-verifiable-student-iden.vercel.app/](https://anchorpass-verifiable-student-iden.vercel.app/)
- **Backend API:** [https://anchorpass-api.onrender.com](https://anchorpass-api.onrender.com)
- **Video Demo:** [Watch Full Demo on Google Drive](https://drive.google.com/file/d/1x-I8TTi3dKf6cXKC2FrtrB2JUh8Psp1y/view?usp=sharing)
- **Contract Address (Testnet):** `CABA6ZABNSL3CSMYYO4IJIXTXOMECQKAT2ML5XKNZK32ZFQ4CHFLR4MT`
- **Google Form Link:** [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSddM4svFMkX84UDjpQGhgsL1s67IZUtCYtb2o9sYjg0ewQ-9g/viewform)
- **Response Sheet:** [Response Sheet Export](https://docs.google.com/spreadsheets/d/1kP9ois02x4WUsM5kdnYJx3IFMasQdSkb_5mZt0_xqeg/edit?usp=sharing)
- **GitHub Repository:** [AnchorPass Source Code](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-upgrade)

---

## 📸 Screenshots & Evidence

| Institution Dashboard | Mobile Responsive View |
|:---:|:---:|
| <img src="images/product_uI.png" width="400" alt="Product UI"> | <img src="images/mobile_responsive.png" width="400" alt="Mobile Design"> |

| Monitoring & Analytics |
|:---:|
| <img src="images/analytics.png" width="400" alt="Analytics"> |

---

## 👥 User Growth & Onboarding (Level 5)

We have successfully onboarded **54 real users** to the AnchorPass platform. Every single user was assigned a unique Stellar Testnet Keypair, fully funded, and performed an on-chain transaction (either registering an institution or being issued a verifiable credential).

To collect comprehensive product feedback, we utilized a Google Form and aggregated all 54 unique responses into our response sheet.

**🔗 User Database & Feedback Export:** [View Full 54-User Dataset (Google Sheets)](https://docs.google.com/spreadsheets/d/1kP9ois02x4WUsM5kdnYJx3IFMasQdSkb_5mZt0_xqeg/edit?usp=sharing)

### 📈 Level 5 Product Iterations
Based on the real user feedback from our 54 testnet users, we implemented several major product upgrades to improve UX/UI, scaling, and retention.

| User Request / Feedback | Implementation | Git Commit Proof |
|---|---|---|
| *"Add a public directory to search verified credentials."* | Built an interactive **Public Directory** portal with search filtering. | [Commit f859ef2](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-upgrade/commit/f859ef2) |
| *"I'd like more analytics features for institutions."* | Added an **Analytics Dashboard** to track active scholarships, seats, and XLM budget. | [Commit bfa3fcc](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-upgrade/commit/bfa3fcc) |
| *"Needs a detailed onboarding tutorial."* | Implemented a step-by-step **Onboarding Welcome Modal** for first-time wallet connections. | [Commit 55d8f8a](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-upgrade/commit/55d8f8a) |
| *"More color themes, preferably a dark mode."* | Created a fully functional **Dark Mode Toggle** utilizing CSS variables and Tailwind. | [Commit 9fcd93d](https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-upgrade/commit/9fcd93d) |

*(For the complete list of 54 users, their unique wallet addresses, and their verified on-chain Soroban Transaction Hashes, please refer to the Google Sheet linked above.)*

---

## 🛠️ Tech Stack & Architecture

- **Frontend Stack:** React 18, Vite, TypeScript, Tailwind CSS
- **Wallet Connection:** Freighter via `@creit.tech/stellar-wallets-kit`
- **Backend Stack:** Node.js, Express, TypeScript, Prisma, PostgreSQL (Supabase)
- **Blockchain:** Stellar Testnet, Soroban (Rust)
- **Storage:** IPFS via Pinata for JSON metadata

## 📝 Smart Contract Functions

| Function | Access | Description |
|---|---|---|
| `register_institution(wallet, name)` | Institution | Register on-chain as an institution |
| `create_scholarship(id, title, amount, seats, deadline)` | Institution | Create a scholarship campaign |
| `assign_student(scholarship_id, student_wallet)` | Institution | Assign an eligible student |
| `claim_scholarship(scholarship_id, student_wallet)` | Student | Claim an assigned scholarship |
| `issue_credential(student, title, metadata_hash)` | Institution | Issue a verifiable credential |
| `verify_credential(credential_id)` | Anyone | Read credential state from chain |
| `revoke_credential(credential_id)` | Owning institution | Permanently revoke a credential |

---

## 💻 Local Setup & Development

To run AnchorPass locally, ensure you have Node.js and npm installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anumehta70/AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-.git
   cd AnchorPass-Verifiable-Student-Identity-Scholarship-Platform-on-Stellar-
   ```

2. **Start the API Server (Backend):**
   ```bash
   cd apps/api
   npm install
   npm run dev
   ```

3. **Start the Frontend Web App:**
   Open a new terminal window:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

*(Ensure you connect the Freighter Wallet browser extension and set it to Stellar Testnet).*

---
*AnchorPass was built for the Stellar Community Fund. License: MIT.*