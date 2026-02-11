<p align="center">
  <img src="https://img.shields.io/badge/Stellar-Soroban-7C3AED?style=for-the-badge&logo=stellar&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Network-Testnet-22C55E?style=for-the-badge" />
</p>

# 🚀 NovaFund

**Decentralized crowdfunding platform — powered by Stellar Soroban.**

NovaFund is a transparent and secure Web3 crowdfunding dApp built on Stellar Soroban smart contracts. Create campaigns, donate with XLM, and track every transaction on-chain.

---

## ✨ Features

- 🎨 **Modern UI** — Dark theme, glassmorphism, gradient animations
- 🔗 **Freighter Wallet** — Auto-detect, connect, Testnet validation, install redirect
- 📝 **Multi-Campaign** — Create, donate, track progress in real time
- ⚡ **Soroban Contract** — On-chain campaign management with `require_auth` security
- 🔄 **Live Data** — Real-time campaign info fetched directly from the contract

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Wallet | Freighter API (`@stellar/freighter-api`) |
| Blockchain | Stellar Soroban (Testnet) |
| Contract | Rust, `soroban-sdk` v20 |
| SDK | `@stellar/stellar-sdk` |

---

## 📁 Project Structure

```
nova-fund/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + WalletProvider
│   │   ├── page.tsx            # Main page (live data fetching)
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Navbar.tsx          # Logo + wallet connection
│   │   ├── Hero.tsx            # Headline + platform stats
│   │   ├── ProjectGrid.tsx     # Campaign cards + donation
│   │   ├── HowItWorks.tsx      # 4-step guide
│   │   ├── CallToAction.tsx    # Newsletter signup
│   │   └── Footer.tsx          # Footer
│   ├── context/
│   │   └── WalletContext.tsx   # Freighter wallet management
│   ├── lib/
│   │   └── contract.ts         # Soroban RPC calls
│   └── constants.ts            # Contract ID, RPC URL
├── contracts/
│   └── nova_fund_contract/
│       ├── Cargo.toml
│       └── src/lib.rs          # Soroban smart contract
└── nova_fund_contract.wasm     # Compiled WASM binary
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- [Freighter Wallet](https://www.freighter.app/) (browser extension)
- Rust + `wasm32-unknown-unknown` target (for contract development)

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser → http://localhost:3000
```

### Contract Build

```bash
cd contracts/nova_fund_contract
cargo build --target wasm32-unknown-unknown --release
```

---

## 📜 Smart Contract

**Contract ID:** `CBBXI7YJ24USTYZGF3I3Z3GYTQQW2VWLPBEGTZF5LNNWEKZ45T4X6MY5`

[View on Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CBBXI7YJ24USTYZGF3I3Z3GYTQQW2VWLPBEGTZF5LNNWEKZ45T4X6MY5)

### Functions

| Function | Description | Auth |
|----------|-------------|------|
| `initialize(admin)` | Initialize contract | ✅ admin |
| `create_campaign(creator, title, target)` | Create a new campaign | ✅ creator |
| `donate(campaign_id, donor, amount)` | Donate to a campaign | ✅ donor |
| `get_campaign(campaign_id)` | Get single campaign info | — |
| `get_all_campaigns()` | List all campaigns | — |

### Storage Layout

| Type | Key | Value |
|------|-----|-------|
| Instance | `Admin` | `Address` |
| Instance | `CampaignCount` | `u32` |
| Persistent | `Campaign(id)` | `Campaign { id, creator, title, target, raised }` |

---

## 💰 Donation Flow

```
User → Enter XLM amount → Send
  → simulateTransaction
  → assembleTransaction
  → Freighter popup (sign)
  → sendTransaction
  → waitForTx (polling)
  → ✅ Success → Card auto-refreshes
```

---

## 🌐 Network

| Parameter | Value |
|-----------|-------|
| Network | Stellar Testnet |
| RPC | `https://soroban-testnet.stellar.org:443` |
| Passphrase | `Test SDF Network ; September 2015` |

---

## 📄 License

MIT

---

<br/>

---

<br/>

# 🇹🇷 Türkçe

# 🚀 NovaFund

**Merkeziyetsiz bağış toplama platformu — Stellar Soroban üzerinde.**

NovaFund, Stellar Soroban akıllı kontratları ile çalışan, şeffaf ve güvenli bir Web3 crowdfunding dApp'tir. Kampanya oluşturabilir, XLM ile bağış yapabilir ve tüm işlemleri blockchain üzerinde takip edebilirsiniz.

---

## ✨ Özellikler

- 🎨 **Modern UI** — Dark tema, glassmorphism, gradient animasyonlar
- 🔗 **Freighter Wallet** — Tespit, bağlantı, Testnet doğrulama, otomatik yönlendirme
- 📝 **Çoklu Kampanya** — Oluştur, bağış yap, ilerlemesini takip et
- ⚡ **Soroban Kontrat** — On-chain kampanya yönetimi, `require_auth` güvenliği
- 🔄 **Canlı Veri** — Kontrattan gerçek zamanlı kampanya bilgisi

---

## 🏗️ Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Wallet | Freighter API (`@stellar/freighter-api`) |
| Blockchain | Stellar Soroban (Testnet) |
| Kontrat | Rust, `soroban-sdk` v20 |
| SDK | `@stellar/stellar-sdk` |

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- [Freighter Wallet](https://www.freighter.app/) (tarayıcı eklentisi)
- Rust + `wasm32-unknown-unknown` target (kontrat geliştirme için)

### Frontend

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu
npm run dev

# Tarayıcıda aç → http://localhost:3000
```

### Kontrat Derleme

```bash
cd contracts/nova_fund_contract
cargo build --target wasm32-unknown-unknown --release
```

---

## 📜 Akıllı Kontrat

**Contract ID:** `CBBXI7YJ24USTYZGF3I3Z3GYTQQW2VWLPBEGTZF5LNNWEKZ45T4X6MY5`

[Stellar Expert'te Görüntüle →](https://stellar.expert/explorer/testnet/contract/CBBXI7YJ24USTYZGF3I3Z3GYTQQW2VWLPBEGTZF5LNNWEKZ45T4X6MY5)

### Fonksiyonlar

| Fonksiyon | Açıklama | Auth |
|-----------|----------|------|
| `initialize(admin)` | Kontratı başlat | ✅ admin |
| `create_campaign(creator, title, target)` | Yeni kampanya oluştur | ✅ creator |
| `donate(campaign_id, donor, amount)` | Kampanyaya bağış yap | ✅ donor |
| `get_campaign(campaign_id)` | Tek kampanya bilgisi | — |
| `get_all_campaigns()` | Tüm kampanyalar | — |

### Storage

| Tip | Anahtar | Değer |
|-----|---------|-------|
| Instance | `Admin` | `Address` |
| Instance | `CampaignCount` | `u32` |
| Persistent | `Campaign(id)` | `Campaign { id, creator, title, target, raised }` |

---

## 💰 Bağış Akışı

```
Kullanıcı → XLM miktarı gir → Gönder
  → simulateTransaction
  → assembleTransaction
  → Freighter popup (imzala)
  → sendTransaction
  → waitForTx (polling)
  → ✅ Başarılı → Kart otomatik yenilenir
```

---

## 🌐 Ağ Bilgileri

| Parametre | Değer |
|-----------|-------|
| Ağ | Stellar Testnet |
| RPC | `https://soroban-testnet.stellar.org:443` |
| Passphrase | `Test SDF Network ; September 2015` |

---

## 📄 Lisans

MIT

---

<p align="center">
  <b>NovaFund</b> — Fund the Future with Blockchain. 🚀
</p>
