# Copilot instructions — Nova Fund

This file contains concise, actionable guidance for AI coding agents working in this repository.

## Big picture
- Frontend: Next.js 13 app (app router) in `src/app` with client components (look for `'use client'`). Styling via Tailwind.
- Wallet: Browser wallet integration uses Freighter (`@stellar/freighter-api`) and is wrapped in `src/context/WalletContext.tsx`.
- Blockchain: On-chain contract implemented with Soroban (Rust) in `contracts/nova_fund_contract/`.
- Bridge code: JS/TS helpers that talk to Soroban live under `src/lib/` and `src/app/lib/` and use `@stellar/stellar-sdk`.

## Key files to read first
- `src/context/WalletContext.tsx` — wallet connect/disconnect patterns, `requestAccess()` handling and a `retrievePublicKey` fallback.
- `src/constants.ts` — `CONTRACT_ID`, `NETWORK_PASSPHRASE`, `RPC_URL` (Testnet RPC).
- `src/app/lib/stellar.ts` & `src/lib/stellar.ts` — examples of creating `SorobanClient.Rpc.Server` and calling contract view/data.
- `src/app/page.tsx` — top-level page which fetches contract state via `getContractState()` and wires components.
- `contracts/nova_fund_contract/src/lib.rs` — contract API surface: `initialize`, `donate`, `get_campaign_info`, `withdraw`.

## Contract interface (important)
- `get_campaign_info()` returns `(raised: i128, target: i128, deadline: u64)` — frontend expects to parse that tuple.
- `donate(donor: Address, amount: i128)` requires the donor to `require_auth()` and transfers token -> contract.
- When implementing client calls, match names exactly (`get_campaign_info`, `donate`, etc.) and convert JS numbers to the appropriate SCVal types.

## Developer workflows (commands)
- Frontend dev server: `npm run dev` (uses Next.js). Files to edit: `src/app/*`, `src/components/*`.
- Build frontend: `npm run build` and `npm run start` for production.
- Build contract (produce wasm):

  cd contracts/nova_fund_contract
  cargo build --target wasm32-unknown-unknown --release

  Output wasm: `contracts/nova_fund_contract/target/wasm32-unknown-unknown/release/*.wasm` (Cargo.toml already sets `crate-type = ["cdylib"]`).

## Patterns & conventions
- UI: Components are PascalCase in `src/components`. Use Tailwind utility classes; some custom token color names like `stellar-...` appear in the CSS.
- Client vs Server: Files with `'use client'` at the top are client components and may access `window` (e.g., Freighter). Keep wallet code client-side only.
- Wallet handling: Prefer using `isConnected()` and `requestAccess()` from `@stellar/freighter-api`; fallback to `window.freighter.getPublicKey()` if necessary (see `WalletContext.tsx`).
- Address display formatting: `Navbar` uses a safe string conversion and slices first/last 4 chars — follow that for UI consistency.

## Integration notes & gotchas
- `src/constants.ts` points to Soroban testnet RPC — do not hardcode a different RPC without updating this file.
- Contract views may return SCVal tuples; existing helper `src/app/lib/stellar.ts` attempts to read raw contract data using `server.getContractData(...)`. When adding new view calls, use the SDK helpers to convert SCVal to JS types.
- Contract expects 128-bit integers (`i128`) for token amounts — ensure amounts are encoded/decoded correctly when calling from JS.

## Example snippets (where to look)
- Wallet connect: `src/context/WalletContext.tsx` (connectWallet uses `requestAccess()` and then `retrievePublicKey`).
- Contract state read: `src/app/page.tsx` calls `getContractState()` from `src/lib/stellar.ts`.
- Contract source showing exact names/types: `contracts/nova_fund_contract/src/lib.rs`.

## What to do when adding features
- Update `src/constants.ts` if you change networks or contract ID.
- Keep wallet interactions inside `src/context/WalletContext.tsx` or similar client-only modules.
- When adding new contract calls, add a typed wrapper in `src/lib/stellar.ts` and call from pages/components; mirror the contract fn signature and SCVal conversions.

If anything in this summary is unclear or you'd like more examples (e.g., SCVal conversion snippets, Freighter call flows, or a sample deploy script), tell me which area and I'll iterate.
