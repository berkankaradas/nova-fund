#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, token};

// Kampanya verilerini saklamak için anahtarlar
#[contracttype]
pub enum DataKey {
    Recipient,  // Kampanya sahibi (Parayı alacak kişi)
    Deadline,   // Bitiş zamanı
    Target,     // Hedef miktar
    Raised,     // Toplanan miktar
    Token,      // Kabul edilen token (örn: XLM)
    State,      // Kampanya durumu (Aktif/Bitti)
}

#[contract]
pub struct NovaFundContract;

#[contractimpl]
impl NovaFundContract {
    
    // 1. KAMPANYAYI BAŞLATMA (INITIALIZE)
    // Bu fonksiyon kontrat deploy edildiğinde bir kez çağrılır.
    pub fn initialize(
        e: Env, 
        recipient: Address, 
        token: Address, 
        deadline: u64, 
        target: i128
    ) {
        // Zaten başlatılmışsa hata ver (güvenlik)
        if e.storage().instance().has(&DataKey::Recipient) {
            panic!("Kampanya zaten başlatılmış!");
        }

        // Verileri kaydet
        e.storage().instance().set(&DataKey::Recipient, &recipient);
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::Deadline, &deadline);
        e.storage().instance().set(&DataKey::Target, &target);
        e.storage().instance().set(&DataKey::Raised, &0_i128); // Başlangıçta 0 toplandı
    }

    // 2. BAĞIŞ YAPMA (DONATE)
    // Kullanıcı bu fonksiyonu çağırarak kontrata para gönderir.
    pub fn donate(e: Env, donor: Address, amount: i128) {
        // 1. Kontrol: Bağış yapanın imzası (auth) var mı?
        donor.require_auth();

        // 2. Kontrol: Süre doldu mu?
        let deadline: u64 = e.storage().instance().get(&DataKey::Deadline).unwrap();
        if e.ledger().timestamp() > deadline {
            panic!("Kampanya süresi doldu!");
        }

        // 3. Transfer İşlemi: Kullanıcıdan -> Kontrata
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&e, &token_addr);
        
        // Parayı kontratın adresine (current_contract_address) çek
        client.transfer(&donor, &e.current_contract_address(), &amount);

        // 4. Toplanan miktarı güncelle
        let mut raised: i128 = e.storage().instance().get(&DataKey::Raised).unwrap();
        raised += amount;
        e.storage().instance().set(&DataKey::Raised, &raised);
    }

    // 3. DURUM SORGULAMA (GET STATE)
    // Frontend'in kampanya durumunu görmesi için
    pub fn get_campaign_info(e: Env) -> (i128, i128, u64) {
        let raised: i128 = e.storage().instance().get(&DataKey::Raised).unwrap_or(0);
        let target: i128 = e.storage().instance().get(&DataKey::Target).unwrap_or(0);
        let deadline: u64 = e.storage().instance().get(&DataKey::Deadline).unwrap_or(0);
        
        (raised, target, deadline)
    }

    // 4. FONLARI ÇEKME (WITHDRAW)
    // Sadece kampanya sahibi çekebilir
    pub fn withdraw(e: Env) {
        let recipient: Address = e.storage().instance().get(&DataKey::Recipient).unwrap();
        
        // Sadece alıcı (recipient) bu işlemi yapabilir
        recipient.require_auth();

        // Süre kontrolü: Deadline dolmadan çekilemez
        let deadline: u64 = e.storage().instance().get(&DataKey::Deadline).unwrap();
        if e.ledger().timestamp() < deadline {
            panic!("Kampanya süresi henüz dolmadı!");
        }

        // Hedef kontrolü: Target'a ulaşılmadan çekilemez
        let raised: i128 = e.storage().instance().get(&DataKey::Raised).unwrap();
        let target: i128 = e.storage().instance().get(&DataKey::Target).unwrap();
        if raised < target {
            panic!("Hedef miktara ulaşılmadı!");
        }

        // Mevcut bakiyeyi kontrol et
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&e, &token_addr);
        let balance = client.balance(&e.current_contract_address());

        // Parayı alıcıya transfer et
        client.transfer(&e.current_contract_address(), &recipient, &balance);
    }
}