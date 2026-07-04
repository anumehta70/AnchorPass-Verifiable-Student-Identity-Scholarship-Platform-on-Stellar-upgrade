# Building & Testing the AnchorPass Contract

This contract was written against `soroban-sdk = "21.7.4"`. It requires a
current Rust toolchain (1.79+) — it was **not** possible to compile it inside
the sandbox used to generate this scaffold (only rustc 1.75 was available
there, which is too old for current crates.io dependency trees). Run these
steps on your own machine before you rely on it.

## 1. Install Rust + the wasm target

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32-unknown-unknown
```

## 2. Install the Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
stellar --version
```

## 3. Run the unit tests

```bash
cd contracts
cargo test -p anchorpass
```

You should see 7 passing tests covering: institution registration
(including double-registration rejection), the full scholarship →
assignment → claim → credential issue → verify → revoke lifecycle, claiming
without assignment, a scholarship at capacity, an expired scholarship, and
cross-institution revoke rejection.

If anything fails to compile, it is most likely a soroban-sdk version drift
since this was written — bump the version in `Cargo.toml` to whatever
`stellar contract init` currently scaffolds, the API is stable across minor
versions.

## 4. Build the WASM

```bash
cd contracts/anchorpass
stellar contract build
```

Output: `target/wasm32-unknown-unknown/release/anchorpass.wasm`

## 5. Set up a Testnet identity + fund it

```bash
stellar keys generate institution-deployer --network testnet
stellar keys fund institution-deployer --network testnet
```

## 6. Deploy to Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/anchorpass.wasm \
  --source institution-deployer \
  --network testnet
```

This prints a **Contract ID** — save it. You'll need it for:
- `apps/api/.env` → `SOROBAN_CONTRACT_ID`
- `apps/web/.env` → `VITE_SOROBAN_CONTRACT_ID`
- The README's "Contract deployment address" field

## 7. Sanity-check with a manual call

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source institution-deployer \
  --network testnet \
  -- register_institution \
  --institution_wallet <YOUR_WALLET_ADDRESS> \
  --name "Test University"
```

Then read it back:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source institution-deployer \
  --network testnet \
  -- get_institution \
  --wallet <YOUR_WALLET_ADDRESS>
```

Record the deployment transaction hash from step 6 — that's one of your
required "screenshots / proof" items for the submission.
