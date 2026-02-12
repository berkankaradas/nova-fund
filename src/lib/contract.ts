"use client";

// ============================================================
// KONTRAT SERVİS KATMANI — NovaFund
// ============================================================
//
// stellar-sdk v14.5 + Next.js 16 ESM bundler kombinasyonunda,
// Server.prepareTransaction() ve Server.sendTransaction() içindeki
// `instanceof Transaction` kontrolleri başarısız oluyor.
//
// ÇÖZÜM: simulateTransaction ve sendTransaction için doğrudan
// JSON-RPC çağrıları kullanıyoruz. Bu yaklaşım SDK'nın sınıf
// kontrollerini tamamen atlar.
//
// SDK sadece şunlar için kullanılır:
//   - TransactionBuilder (TX oluşturma)
//   - xdr.* (XDR parse/encode)
//   - nativeToScVal / scValToBigInt (veri dönüşümü)
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
import { signTransaction } from "@stellar/freighter-api";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "../constants";

// ─── SETUP ──────────────────────────────────────────────────

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

// ─── RAW JSON-RPC ───────────────────────────────────────────

/**
 * Soroban RPC'ye doğrudan JSON-RPC çağrısı yapar.
 * SDK'nın Server sınıfını ve instanceof kontrollerini atlar.
 */
async function rpc(method: string, params: Record<string, any> = {}): Promise<any> {
    const res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) {
        throw new Error(`RPC ${method} hatası: ${JSON.stringify(json.error)}`);
    }
    return json.result;
}

/**
 * Horizon API'den hesap bilgisi çeker.
 */
async function getHorizonAccount(address: string): Promise<Account> {
    const res = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${address}`
    );
    if (!res.ok) throw new Error(`Hesap bulunamadı: ${address}`);
    const data = await res.json();
    return new Account(address, data.sequence);
}

// ─── OKUMA FONKSİYONLARI ────────────────────────────────────

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

        // Raw RPC ile simüle et
        const sim = await rpc("simulateTransaction", {
            transaction: tx.toXDR(),
        });

        if (sim.error) {
            console.error("Simülasyon hatası:", sim.error);
            return [];
        }

        if (sim.results && sim.results.length > 0) {
            const retval = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
            return parseCampaigns(retval);
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

        const tx = new TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                contract.call("get_campaign", nativeToScVal(campaignId, { type: "u32" }))
            )
            .setTimeout(30)
            .build();

        const sim = await rpc("simulateTransaction", {
            transaction: tx.toXDR(),
        });

        if (sim.error || !sim.results?.length) return null;

        const retval = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
        return parseSingleCampaign(retval);
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

        return await simulateSignSend(tx);
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

        return await simulateSignSend(tx);
    } catch (error) {
        console.error("Bağış hatası:", error);
        return false;
    }
}

// ─── ÇEKIRDEK: Simulate → Assemble → Sign → Send ───────────

/**
 * Tam transaction akışı — SDK Server sınıfı KULLANILMAZ.
 *
 * 1. TX'i XDR olarak simüle et (raw JSON-RPC)
 * 2. Simülasyon sonuçlarıyla yeni TX oluştur (SorobanData + auth + fee)
 * 3. Freighter ile XDR string olarak imzalat
 * 4. İmzalı XDR'ı raw JSON-RPC ile gönder
 * 5. İşlem onayını bekle (polling)
 */
async function simulateSignSend(originalTx: any): Promise<boolean> {
    const originalXdr = originalTx.toXDR();

    // ── STEP 1: Simüle et ──
    const sim = await rpc("simulateTransaction", {
        transaction: originalXdr,
    });

    if (sim.error) {
        console.error("Simülasyon başarısız:", sim.error);
        return false;
    }

    // ── STEP 2: Prepared TX oluştur ──
    // Simülasyon sonuçlarından SorobanTransactionData al
    const sorobanData = xdr.SorobanTransactionData.fromXDR(
        sim.transactionData,
        "base64"
    );

    // Auth entry'leri al
    const authEntries: xdr.SorobanAuthorizationEntry[] = [];
    if (sim.results?.[0]?.auth) {
        for (const authXdr of sim.results[0].auth) {
            authEntries.push(
                xdr.SorobanAuthorizationEntry.fromXDR(authXdr, "base64")
            );
        }
    }

    // Minimum resource fee
    const minResourceFee = parseInt(sim.minResourceFee || "0", 10);
    const totalFee = (minResourceFee + 100000).toString(); // 0.01 XLM buffer

    // Orijinal TX'in source account'unu yeniden çek (sequence güncel olsun)
    const source = originalTx.source;
    const account = await getHorizonAccount(source);

    // Orijinal operation'ı XDR envelope'dan al
    // (tx.operations[0] high-level JS objesi, toXDR yok — envelope'dan çekmek gerekir)
    const envelope = xdr.TransactionEnvelope.fromXDR(originalXdr, "base64");
    const txBody = envelope.v1().tx();
    const originalOp = txBody.operations()[0];

    // Auth'u operation'a ekle
    if (authEntries.length > 0) {
        const opBody = originalOp.body() as any;
        if (opBody.switch().name === "invokeHostFunction") {
            const invokeOp = opBody.invokeHostFunction();
            // Yeni InvokeHostFunctionOp oluştur auth ile
            const newInvokeOp = new xdr.InvokeHostFunctionOp({
                hostFunction: invokeOp.hostFunction(),
                auth: authEntries,
            });
            const newBody = xdr.OperationBody.invokeHostFunction(newInvokeOp);
            // Yeni operation oluştur
            const newOp = new xdr.Operation({
                sourceAccount: originalOp.sourceAccount(),
                body: newBody,
            });

            // Prepared TX'i oluştur
            const preparedTx = new TransactionBuilder(account, {
                fee: totalFee,
                networkPassphrase: NETWORK_PASSPHRASE,
            })
                .addOperation(newOp)
                .setSorobanData(sorobanData)
                .setTimeout(60)
                .build();

            return await signAndSend(preparedTx);
        }
    }

    // Auth yoksa direkt sorobanData ekle
    const preparedTx = new TransactionBuilder(account, {
        fee: totalFee,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(originalOp)
        .setSorobanData(sorobanData)
        .setTimeout(60)
        .build();

    return await signAndSend(preparedTx);
}

/**
 * Freighter ile imzala ve raw RPC ile gönder.
 */
async function signAndSend(preparedTx: any): Promise<boolean> {
    // ── STEP 3: Freighter ile imzalat ──
    const preparedXdr = preparedTx.toXDR();

    const signResult = await signTransaction(preparedXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedXdr =
        typeof signResult === "string"
            ? signResult
            : (signResult as any).signedTxXdr;

    if (!signedXdr) {
        console.error("İmzalama başarısız — XDR alınamadı");
        return false;
    }

    // ── STEP 4: Raw RPC ile gönder ──
    const sendResult = await rpc("sendTransaction", {
        transaction: signedXdr,
    });

    if (sendResult.status === "ERROR") {
        console.error("Gönderme başarısız:", sendResult);
        return false;
    }

    // ── STEP 5: Onay bekle ──
    return await waitForConfirmation(sendResult.hash);
}

/**
 * İşlem onayını bekler (max 30 saniye polling).
 */
async function waitForConfirmation(hash: string): Promise<boolean> {
    for (let i = 0; i < 30; i++) {
        try {
            const result = await rpc("getTransaction", { hash });
            if (result.status === "SUCCESS") return true;
            if (result.status === "FAILED") return false;
            // NOT_FOUND = henüz işlenmedi, tekrar dene
        } catch {
            // RPC hatası, tekrar dene
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
