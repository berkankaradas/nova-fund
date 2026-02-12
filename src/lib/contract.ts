"use client";

// ============================================================
// KONTRAT SERVİS KATMANI — NovaFund
// ============================================================
//
// Soroban RPC üzerinden kontrat fonksiyonlarını çağırır.
//
// ÖNEMLİ: stellar-sdk v14.5 + Next.js ESM bundler kombinasyonu
// farklı Transaction sınıfı örnekleri oluşturur. Server.prepareTransaction()
// ve Server.sendTransaction() dahili olarak `instanceof Transaction` kontrolü
// yapar — bu kontrol ESM/CJS sınır çakışmasından başarısız olur.
//
// ÇÖZÜM: Her SDK metodu çağrısından önce TX'i XDR üzerinden
// yeniden oluşturuyoruz (roundtrip):
//   tx.toXDR() → TransactionBuilder.fromXDR(xdr, networkPassphrase)
//
// Bu, SDK'nın kendi modülündeki Transaction sınıfını kullanmasını garanti eder.
// ============================================================

import {
    Contract,
    TransactionBuilder,
    Account,
    nativeToScVal,
    scValToBigInt,
    Address,
    Networks,
    xdr,
} from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import { signTransaction } from "@stellar/freighter-api";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "../constants";

// ─── SETUP ──────────────────────────────────────────────────

const server = new Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);
const VOID_PUBKEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

// ─── TİPLER ─────────────────────────────────────────────────

export interface CampaignData {
    id: number;
    creator: string;
    title: string;
    target: number;
    raised: number;
}

// ─── ESM/CJS FIX ────────────────────────────────────────────

/**
 * Transaction'ı XDR üzerinden yeniden oluşturur.
 * Bu, ESM/CJS sınıf uyumsuzluğunu çözer.
 *
 * Neden gerekli:
 * - Next.js ESM bundler, stellar-sdk'yı iki kez yükleyebilir
 * - build() tarafından dönen Transaction, Server modülündeki
 *   Transaction sınıfından farklı bir instance olur
 * - instanceof kontrolü başarısız → "expected a Transaction" hatası
 * - fromXDR() ise her zaman çağıran modülün Transaction'ını döner
 */
function toCleanXDR(builtTx: any): string {
    return builtTx.toXDR();
}

function fromCleanXDR(xdrString: string) {
    return TransactionBuilder.fromXDR(xdrString, NETWORK_PASSPHRASE);
}

// ─── OKUMA FONKSİYONLARI ────────────────────────────────────

export async function getAllCampaigns(): Promise<CampaignData[]> {
    try {
        const account = new Account(VOID_PUBKEY, "0");

        const built = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call("get_all_campaigns"))
            .setTimeout(30)
            .build();

        // XDR roundtrip → fromXDR ile yeniden oluştur
        const tx = fromCleanXDR(toCleanXDR(built));

        const response = await server.simulateTransaction(tx);

        if ("error" in response) {
            console.error("Simülasyon hatası:", response);
            return [];
        }

        if (response.result) {
            return parseCampaigns(response.result.retval);
        }

        return [];
    } catch (error) {
        console.error("Kampanyalar alınamadı:", error);
        return [];
    }
}

export async function getCampaign(campaignId: number): Promise<CampaignData | null> {
    try {
        const account = new Account(VOID_PUBKEY, "0");

        const built = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                contract.call("get_campaign", nativeToScVal(campaignId, { type: "u32" }))
            )
            .setTimeout(30)
            .build();

        const tx = fromCleanXDR(toCleanXDR(built));
        const response = await server.simulateTransaction(tx);

        if ("error" in response || !response.result) return null;

        return parseSingleCampaign(response.result.retval);
    } catch (error) {
        console.error("Kampanya alınamadı:", error);
        return null;
    }
}

// ─── YAZMA FONKSİYONLARI ───────────────────────────────────

export async function createCampaign(
    creatorAddress: string,
    title: string,
    targetXlm: number
): Promise<boolean> {
    try {
        const account = await getHorizonAccount(creatorAddress);
        const targetStroops = BigInt(Math.round(targetXlm * 10_000_000));

        const built = new TransactionBuilder(account, {
            fee: "1000000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                contract.call(
                    "create_campaign",
                    nativeToScVal(creatorAddress, { type: "address" }),
                    nativeToScVal(title, { type: "string" }),
                    nativeToScVal(targetStroops, { type: "i128" })
                )
            )
            .setTimeout(60)
            .build();

        return await prepareSignSend(built);
    } catch (error) {
        console.error("Kampanya oluşturma hatası:", error);
        return false;
    }
}

export async function donate(
    campaignId: number,
    donorAddress: string,
    amountXlm: number
): Promise<boolean> {
    try {
        const account = await getHorizonAccount(donorAddress);
        const amountStroops = BigInt(Math.round(amountXlm * 10_000_000));

        const built = new TransactionBuilder(account, {
            fee: "1000000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                contract.call(
                    "donate",
                    nativeToScVal(campaignId, { type: "u32" }),
                    nativeToScVal(donorAddress, { type: "address" }),
                    nativeToScVal(amountStroops, { type: "i128" })
                )
            )
            .setTimeout(60)
            .build();

        return await prepareSignSend(built);
    } catch (error) {
        console.error("Bağış hatası:", error);
        return false;
    }
}

// ─── ÇEKIRDEK AKIŞ: Prepare → Sign → Send ──────────────────

/**
 * Tam transaction akışı:
 *
 * 1. build()     → ham Transaction (ESM sınıfı, Server kabul etmez)
 * 2. toXDR()     → XDR string (sınıf bilgisi kaybolur)
 * 3. fromXDR()   → yeni Transaction (Server'ın modülüyle uyumlu)
 * 4. prepare()   → simülasyon + footprint ekleme → prepared TX
 * 5. toXDR()     → prepared XDR string (Freighter'a gönderilir)
 * 6. sign()      → Freighter popup → imzalı XDR string
 * 7. fromXDR()   → imzalı Transaction (Server'ın modülüyle uyumlu)
 * 8. send()      → ağa gönder → hash
 * 9. poll()      → onay bekle
 */
async function prepareSignSend(builtTx: any): Promise<boolean> {
    // STEP 1-3: XDR roundtrip — Server'ın kabul edeceği Transaction oluştur
    const cleanTx = fromCleanXDR(toCleanXDR(builtTx));

    // STEP 4: Simüle + hazırla (footprint, auth, resource fee eklenir)
    const prepared = await server.prepareTransaction(cleanTx);

    // STEP 5: Prepared TX'i XDR'a çevir
    const preparedXdr = prepared.toXDR();

    // STEP 6: Freighter ile imzalat — sadece XDR string gönder
    const signResult = await signTransaction(preparedXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
    });

    // signTransaction response formatı: string veya { signedTxXdr: string }
    const signedXdr = typeof signResult === "string"
        ? signResult
        : (signResult as any).signedTxXdr;

    if (!signedXdr) {
        console.error("İmzalama başarısız — XDR alınamadı");
        return false;
    }

    // STEP 7: İmzalı XDR'dan Transaction oluştur (Server uyumlu)
    const signedTx = fromCleanXDR(signedXdr);

    // STEP 8: Ağa gönder
    const sendResult = await server.sendTransaction(signedTx);

    // STEP 9: Onay bekle
    return await waitForConfirmation(sendResult.hash);
}

// ─── YARDIMCI FONKSİYONLAR ─────────────────────────────────

/**
 * Horizon API'den hesap bilgisi çeker.
 * Soroban RPC'nin getAccount'u bazen eksik dönebilir.
 */
async function getHorizonAccount(address: string): Promise<Account> {
    const res = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${address}`
    );
    if (!res.ok) throw new Error(`Hesap bulunamadı: ${address}`);
    const data = await res.json();
    return new Account(address, data.sequence);
}

/**
 * İşlemin onaylanmasını bekler (polling, max 30 saniye).
 */
async function waitForConfirmation(hash: string): Promise<boolean> {
    for (let i = 0; i < 30; i++) {
        try {
            const result = await server.getTransaction(hash);
            if (result.status === "SUCCESS") return true;
            if (result.status === "FAILED") return false;
        } catch {
            // İşlem henüz ledger'a yazılmadı
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
}

// ─── PARSE FONKSİYONLARI ────────────────────────────────────

function parseCampaigns(scVal: xdr.ScVal): CampaignData[] {
    try {
        const vec = scVal.vec();
        if (!vec) return [];
        return vec
            .map((item) => parseSingleCampaign(item))
            .filter((c): c is CampaignData => c !== null);
    } catch (error) {
        console.error("Kampanya parse hatası:", error);
        return [];
    }
}

function parseSingleCampaign(scVal: xdr.ScVal): CampaignData | null {
    try {
        const fields = scVal.map();
        if (!fields) return null;

        const get = (key: string): xdr.ScVal | undefined => {
            const entry = fields.find(
                (e) => e.key().sym()?.toString() === key
            );
            return entry?.val();
        };

        const idVal = get("id");
        const creatorVal = get("creator");
        const titleVal = get("title");
        const targetVal = get("target");
        const raisedVal = get("raised");

        if (!idVal || !creatorVal || !titleVal || !targetVal || !raisedVal) return null;

        return {
            id: idVal.u32() ?? 0,
            creator: Address.fromScVal(creatorVal).toString(),
            title: titleVal.str()?.toString() ?? "",
            target: Number(scValToBigInt(targetVal)) / 10_000_000,
            raised: Number(scValToBigInt(raisedVal)) / 10_000_000,
        };
    } catch (error) {
        console.error("Tek kampanya parse hatası:", error);
        return null;
    }
}
