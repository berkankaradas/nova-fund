"use client";

// ============================================================
// KONTRAT SERVİS KATMANI
// ============================================================
// Soroban RPC üzerinden kontrat fonksiyonlarını çağırır.
// SDK v14.5 ESM uyumluluğu için XDR roundtrip yaklaşımı:
//   build() → toXDR() → fromXDR() → Server'a gönder
// ============================================================

import {
    Contract,
    TransactionBuilder,
    Account,
    nativeToScVal,
    scValToBigInt,
    Address,
    xdr,
    Transaction,
} from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import { signTransaction } from "@stellar/freighter-api";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "../constants";

// Soroban RPC sunucusu
const server = new Server(RPC_URL);

// Kontrat referansı
const contract = new Contract(CONTRACT_ID);

// Sanal hesap (view çağrıları için — gas ödemez)
const VOID_PUBKEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

// ─── TİPLER ─────────────────────────────────────────────────

export interface CampaignData {
    id: number;
    creator: string;
    title: string;
    target: number;  // XLM cinsinden
    raised: number;  // XLM cinsinden
}

// ─── YARDIMCI ───────────────────────────────────────────────

/**
 * ESM/CJS sınıf uyumsuzluğunu çözmek için TX'i XDR üzerinden yeniden oluşturur.
 * build() → toXDR() → fromXDR() → prepareTransaction'ın kabul ettiği tip.
 */
function rebuildTx(tx: Transaction): Transaction {
    return TransactionBuilder.fromXDR(tx.toXDR(), NETWORK_PASSPHRASE) as Transaction;
}

/**
 * Horizon API'den hesap bilgisi çeker (Soroban RPC'den daha güvenilir).
 */
async function getAccount(address: string): Promise<Account> {
    const res = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${address}`
    );
    if (!res.ok) throw new Error(`Hesap bulunamadı: ${address}`);
    const data = await res.json();
    return new Account(address, data.sequence);
}

// ─── OKUMA FONKSİYONLARI (View — imza gerektirmez) ──────────

/**
 * Tüm kampanyaları kontrattan çeker.
 * simulateTransaction kullandığı için gas maliyeti yoktur.
 */
export async function getAllCampaigns(): Promise<CampaignData[]> {
    try {
        const account = new Account(VOID_PUBKEY, "0");

        const tx = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call("get_all_campaigns"))
            .setTimeout(30)
            .build();

        // XDR roundtrip → simülasyon
        const response = await server.simulateTransaction(rebuildTx(tx));

        if ("error" in response) {
            console.error("Simülasyon hatası:", response);
            return [];
        }

        // Sonuçtan kampanya verilerini parse et
        if (response.result) {
            return parseCampaigns(response.result.retval);
        }

        return [];
    } catch (error) {
        console.error("Kampanyalar alınamadı:", error);
        return [];
    }
}

/**
 * Tek bir kampanyayı ID ile getirir.
 */
export async function getCampaign(campaignId: number): Promise<CampaignData | null> {
    try {
        const account = new Account(VOID_PUBKEY, "0");

        const tx = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                contract.call("get_campaign", nativeToScVal(campaignId, { type: "u32" }))
            )
            .setTimeout(30)
            .build();

        const response = await server.simulateTransaction(rebuildTx(tx));

        if ("error" in response || !response.result) return null;

        return parseSingleCampaign(response.result.retval);
    } catch (error) {
        console.error("Kampanya alınamadı:", error);
        return null;
    }
}

// ─── YAZMA FONKSİYONLARI (Freighter imzası gerektirir) ─────

/**
 * Yeni kampanya oluşturur.
 */
export async function createCampaign(
    creatorAddress: string,
    title: string,
    targetXlm: number
): Promise<boolean> {
    try {
        const account = await getAccount(creatorAddress);
        const targetStroops = BigInt(Math.round(targetXlm * 10_000_000));

        const tx = new TransactionBuilder(account, {
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

        // Simüle → hazırla → imzalat → gönder
        const prepared = await server.prepareTransaction(rebuildTx(tx));

        const signedXdr = await signTransaction(prepared.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });

        const finalXdr = typeof signedXdr === "string"
            ? signedXdr
            : (signedXdr as any).signedTxXdr;

        const result = await server.sendTransaction(
            TransactionBuilder.fromXDR(finalXdr, NETWORK_PASSPHRASE) as Transaction
        );

        return await waitForTx(result.hash);
    } catch (error) {
        console.error("Kampanya oluşturma hatası:", error);
        return false;
    }
}

/**
 * Bir kampanyaya bağış yapar.
 */
export async function donate(
    campaignId: number,
    donorAddress: string,
    amountXlm: number
): Promise<boolean> {
    try {
        const account = await getAccount(donorAddress);
        const amountStroops = BigInt(Math.round(amountXlm * 10_000_000));

        const tx = new TransactionBuilder(account, {
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

        // Simüle → hazırla → imzalat → gönder
        const prepared = await server.prepareTransaction(rebuildTx(tx));

        const signedXdr = await signTransaction(prepared.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });

        const finalXdr = typeof signedXdr === "string"
            ? signedXdr
            : (signedXdr as any).signedTxXdr;

        const result = await server.sendTransaction(
            TransactionBuilder.fromXDR(finalXdr, NETWORK_PASSPHRASE) as Transaction
        );

        return await waitForTx(result.hash);
    } catch (error) {
        console.error("Bağış hatası:", error);
        return false;
    }
}

// ─── YARDIMCI FONKSİYONLAR ─────────────────────────────────

/**
 * İşlemin onaylanmasını bekler (polling).
 */
async function waitForTx(hash: string): Promise<boolean> {
    for (let i = 0; i < 30; i++) {
        try {
            const result = await server.getTransaction(hash);
            if (result.status === "SUCCESS") return true;
            if (result.status === "FAILED") return false;
        } catch {
            // İşlem henüz işlenmedi
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
