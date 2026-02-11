#![no_std]

// ============================================================
// NovaFund — Merkeziyetsiz Bağış Toplama Kontratı
// ============================================================
// Stellar Soroban üzerinde çoklu kampanya desteği sunan
// crowdfunding akıllı kontratı.
//
// Fonksiyonlar:
//   1. initialize    — Kontratı başlat, admin ata
//   2. create_campaign — Yeni kampanya oluştur
//   3. donate         — Kampanyaya bağış yap (XLM)
//   4. get_campaign   — Tek kampanya bilgisi
//   5. get_all_campaigns — Tüm kampanyaları listele
// ============================================================

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String, Vec,
};

// ─── VERİ YAPILARI ──────────────────────────────────────────

/// Kampanya bilgilerini tutan yapı
#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub id: u32,            // Benzersiz kampanya kimliği
    pub creator: Address,   // Kampanyayı oluşturan kişi
    pub title: String,      // Kampanya başlığı
    pub target: i128,       // Hedef miktar (stroop cinsinden, 1 XLM = 10^7 stroop)
    pub raised: i128,       // Toplanan miktar
}

/// Kontrat storage anahtarları
#[contracttype]
pub enum DataKey {
    Admin,              // Instance: Kontrat yöneticisi (Address)
    CampaignCount,      // Instance: Toplam kampanya sayısı (u32)
    Campaign(u32),      // Persistent: Kampanya verisi (Campaign)
}

// ─── KONTRAT ────────────────────────────────────────────────

#[contract]
pub struct NovaFundContract;

#[contractimpl]
impl NovaFundContract {

    // ═══════════════════════════════════════════════════════
    // 1. BAŞLATMA (INITIALIZE)
    // ═══════════════════════════════════════════════════════
    // Kontrat deploy edildikten sonra bir kez çağrılır.
    // Admin adresini ve kampanya sayacını sıfırlar.
    pub fn initialize(env: Env, admin: Address) {
        // Güvenlik: Zaten başlatılmışsa hata ver
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Kontrat zaten başlatılmış!");
        }

        // Admin adresinin işlemi onaylaması gerekiyor
        admin.require_auth();

        // Admin'i kaydet
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Kampanya sayacını sıfırla
        env.storage().instance().set(&DataKey::CampaignCount, &0_u32);
    }

    // ═══════════════════════════════════════════════════════
    // 2. KAMPANYA OLUŞTURMA (CREATE CAMPAIGN)
    // ═══════════════════════════════════════════════════════
    // Herkes yeni bir kampanya oluşturabilir.
    // Otomatik artan ID atanır; hedef stroop cinsindendir.
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        target: i128,
    ) -> u32 {
        // Oluşturucunun imzasını doğrula
        creator.require_auth();

        // Hedef pozitif olmalı
        if target <= 0 {
            panic!("Hedef miktar sıfırdan büyük olmalı!");
        }

        // Mevcut sayacı al ve bir artır
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);

        let new_id = count + 1;

        // Yeni kampanya oluştur
        let campaign = Campaign {
            id: new_id,
            creator,
            title,
            target,
            raised: 0,
        };

        // Kampanyayı persistent storage'a kaydet
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(new_id), &campaign);

        // Sayacı güncelle
        env.storage()
            .instance()
            .set(&DataKey::CampaignCount, &new_id);

        // Oluşturulan kampanya ID'sini döndür
        new_id
    }

    // ═══════════════════════════════════════════════════════
    // 3. BAĞIŞ YAPMA (DONATE)
    // ═══════════════════════════════════════════════════════
    // Belirtilen kampanyaya bağış yapar.
    // Miktar doğrudan kampanyanın "raised" alanına eklenir.
    // Not: Token transferi Step 4'te eklenecek.
    pub fn donate(env: Env, campaign_id: u32, donor: Address, amount: i128) {
        // Bağış yapanın imzasını doğrula
        donor.require_auth();

        // Miktar pozitif olmalı
        if amount <= 0 {
            panic!("Bağış miktarı sıfırdan büyük olmalı!");
        }

        // Kampanyayı getir
        let key = DataKey::Campaign(campaign_id);
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic!("Kampanya bulunamadı!"));

        // Toplanan miktarı güncelle
        campaign.raised += amount;

        // Güncellenmiş kampanyayı kaydet
        env.storage().persistent().set(&key, &campaign);
    }

    // ═══════════════════════════════════════════════════════
    // 4. TEK KAMPANYA SORGULAMA (GET CAMPAIGN)
    // ═══════════════════════════════════════════════════════
    // Verilen ID'ye sahip kampanyanın bilgilerini döndürür.
    pub fn get_campaign(env: Env, campaign_id: u32) -> Campaign {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| panic!("Kampanya bulunamadı!"))
    }

    // ═══════════════════════════════════════════════════════
    // 5. TÜM KAMPANYALARI LİSTELEME (GET ALL CAMPAIGNS)
    // ═══════════════════════════════════════════════════════
    // Tüm kayıtlı kampanyaları Vec olarak döndürür.
    pub fn get_all_campaigns(env: Env) -> Vec<Campaign> {
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);

        let mut campaigns = Vec::new(&env);

        // 1'den başlayarak tüm kampanyaları topla
        let mut i: u32 = 1;
        while i <= count {
            if let Some(campaign) = env
                .storage()
                .persistent()
                .get::<DataKey, Campaign>(&DataKey::Campaign(i))
            {
                campaigns.push_back(campaign);
            }
            i += 1;
        }

        campaigns
    }
}