"use client";

// ============================================================
// KONTRAT SERVİS KATMANI
// ============================================================
// Soroban RPC üzerinden kontrat fonksiyonlarını çağırır.
// get_all_campaigns → simulateTransaction (view)
// create_campaign / donate → Freighter ile imzalama gerektirir
// ============================================================

import {
    Contract,
    TransactionBuilder,
    Account,
    nativeToScVal,
    scValToBigInt,
    Address,
    xdr,
} from "@stellar/stellar-sdk";
import { Server, Api, assembleTransaction } from "@stellar/stellar-sdk/rpc";
import { signTransaction } from "@stellar/freighter-api";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "../constants";

// Soroban RPC sunucusu
const server = new Server(RPC_URL);

// Kontrat referansı
const contract = new Contract(CONTRACT_ID);

// Sanal hesap (view çağrıları için — gas ödemez)
const VOID_PUBKEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

// ─── TİPLER ─────────────────────────────────────────────────

// Frontend'te kullanılan kampanya veri yapısı
export interface CampaignData {
    id: number;
    creator: string;
    title: string;
    target: number;  // XLM cinsinden (stroop'tan dönüştürülmüş)
    raised: number;  // XLM cinsinden
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

        // Simüle et (chain'e göndermeden sonucu al)
        const response = await server.simulateTransaction(tx);

        if (Api.isSimulationSuccess(response) && response.result) {
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

        const response = await server.simulateTransaction(tx);

        if (Api.isSimulationSuccess(response) && response.result) {
            return parseSingleCampaign(response.result.retval);
        }

        return null;
    } catch (error) {
        console.error("Kampanya alınamadı:", error);
        return null;
    }
}

// ─── YAZMA FONKSİYONLARI (Freighter imzası gerektirir) ─────

/**
 * Yeni kampanya oluşturur.
 * Freighter ile imzalanır ve testnet'e gönderilir.
 */
export async function createCampaign(
    creatorAddress: string,
    title: string,
    targetXlm: number
): Promise<boolean> {
    try {
        const account = await server.getAccount(creatorAddress);

        // Hedefi stroop'a çevir (1 XLM = 10^7 stroop)
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

        // Simüle et → hazırla → imzalat → gönder
        const simulated = await server.simulateTransaction(tx);
        if (!Api.isSimulationSuccess(simulated)) {
            console.error("Simülasyon başarısız:", simulated);
            return false;
        }

        const prepared = assembleTransaction(tx, simulated).build();

        const signedXdr = await signTransaction(prepared.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });

        const signedTx = TransactionBuilder.fromXDR(
            typeof signedXdr === "string" ? signedXdr : (signedXdr as any).signedTxXdr,
            NETWORK_PASSPHRASE
        );

        const result = await server.sendTransaction(signedTx);
        return await waitForTx(result.hash);
    } catch (error) {
        console.error("Kampanya oluşturma hatası:", error);
        return false;
    }
}

/**
 * Bir kampanyaya bağış yapar.
 * Freighter ile imzalanır ve testnet'e gönderilir.
 */
export async function donate(
    campaignId: number,
    donorAddress: string,
    amountXlm: number
): Promise<boolean> {
    try {
        const account = await server.getAccount(donorAddress);

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

        const simulated = await server.simulateTransaction(tx);
        if (!Api.isSimulationSuccess(simulated)) {
            console.error("Simülasyon başarısız:", simulated);
            return false;
        }

        const prepared = assembleTransaction(tx, simulated).build();

        const signedXdr = await signTransaction(prepared.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });

        const signedTx = TransactionBuilder.fromXDR(
            typeof signedXdr === "string" ? signedXdr : (signedXdr as any).signedTxXdr,
            NETWORK_PASSPHRASE
        );

        const result = await server.sendTransaction(signedTx);
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
            // İşlem henüz işlenmedi, tekrar dene
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
}

/**
 * ScVal Vec<Campaign> → CampaignData[] dönüştürücüsü.
 */
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

/**
 * Tek bir ScVal Campaign struct → CampaignData dönüştürücüsü.
 */
function parseSingleCampaign(scVal: xdr.ScVal): CampaignData | null {
    try {
        const fields = scVal.map();
        if (!fields) return null;

        // Map entry'lerinden alanları oku
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

        if (!idVal || !creatorVal || !titleVal || !targetVal || !raisedVal) {
            return null;
        }

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
