<p align="center">
  <img src="https://img.shields.io/badge/Stellar-Soroban-7C3AED?style=for-the-badge&logo=stellar&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Network-Testnet-22C55E?style=for-the-badge" />
</p>

# 🚀 NovaFund

**Merkeziyetsiz bağış toplama platformu — Stellar Soroban üzerinde.**

NovaFund, Stellar Soroban akıllı kontratları ile çalışan, şeffaf ve güvenli bir Web3 crowdfunding dApp'tir. Kampanya oluşturabilir, XLM ile bağış yapabilir ve tüm işlemleri blockchain üzerinde takip edebilirsiniz.

---

## ✨ Özellikler

- 🎨 **Modern UI** — Dark theme, glassmorphism, gradient animasyonlar
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

## 📁 Proje Yapısı

```
nova-fund/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + WalletProvider
│   │   ├── page.tsx            # Ana sayfa (canlı veri çekimi)
│   │   └── globals.css         # Global stiller
│   ├── components/
│   │   ├── Navbar.tsx          # Logo + wallet bağlantısı
│   │   ├── Hero.tsx            # Başlık + istatistikler
│   │   ├── ProjectGrid.tsx     # Kampanya kartları + bağış
│   │   ├── HowItWorks.tsx      # 4 adımlı rehber
│   │   ├── CallToAction.tsx    # Bülten kayıt formu
│   │   └── Footer.tsx          # Alt bilgi
│   ├── context/
│   │   └── WalletContext.tsx   # Freighter cüzdan yönetimi
│   ├── lib/
│   │   └── contract.ts         # Soroban RPC çağrıları
│   └── constants.ts            # Contract ID, RPC URL
├── contracts/
│   └── nova_fund_contract/
│       ├── Cargo.toml
│       └── src/lib.rs          # Soroban akıllı kontrat
└── nova_fund_contract.wasm     # Derlenmiş WASM
```

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

# Tarayıcıda aç
# http://localhost:3000
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
  <b>NovaFund</b> — Geleceği Fonla, Blockchain ile. 🚀
</p>
