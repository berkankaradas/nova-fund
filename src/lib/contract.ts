"use client";

// ============================================================
// KONTRAT SERVİS KATMANI — NovaFund
// ============================================================
//
// stellar-sdk v14.5 + Next.js 16 ESM uyumluluk stratejisi:
//
// SORUN: Server.prepareTransaction() ve assembleTransaction() içindeki
// `instanceof Transaction` kontrolü ESM'de çalışmıyor.
//
// ÇÖZÜM: 
// 1. Simülasyon ve gönderim için raw JSON-RPC (fetch) kullanılır
// 2. Prepared TX için operation sıfırdan oluşturulur (auth ile birlikte)
// 3. Mevcut TX'ten operation çıkarmaya ÇALIŞILMAZ
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

async function rpc(method: string, params: Record<string, any> = {}): Promise<any> {
    const res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) throw new Error(`RPC ${method}: ${JSON.stringify(json.error)}`);
    return json.result;
}

async function getHorizonAccount(address: string): Promise<Account> {
    const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
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

        const sim = await rpc("simulateTransaction", { transaction: tx.toXDR() });
        if (sim.error || !sim.results?.length) return [];

        const retval = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
        return parseCampaigns(retval);
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

        const sim = await rpc("simulateTransaction", { transaction: tx.toXDR() });
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
        const targetStroops = BigInt(Math.round(targetXlm * 10_000_000));
        return await invokeContract(creatorAddress, "create_campaign", [
            nativeToScVal(creatorAddress, { type: "address" }),
            nativeToScVal(title, { type: "string" }),
            nativeToScVal(targetStroops, { type: "i128" }),
        ]);
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
        const amountStroops = BigInt(Math.round(amountXlm * 10_000_000));
        return await invokeContract(donorAddress, "donate", [
            nativeToScVal(campaignId, { type: "u32" }),
            nativeToScVal(donorAddress, { type: "address" }),
            nativeToScVal(amountStroops, { type: "i128" }),
        ]);
    } catch (error) {
        console.error("Bağış hatası:", error);
        return false;
    }
}

// ─── ÇEKIRDEK: invokeContract ───────────────────────────────
//
// 1. contract.call() ile simülasyon TX'i oluştur
// 2. Raw RPC ile simüle et
// 3. Simülasyon sonuçlarından auth + sorobanData + fee al
// 4. AYNI parametrelerle YENİ operation oluştur (auth dahil)
// 5. Prepared TX'i oluştur (setSorobanData ile)
// 6. Freighter ile imzalat (XDR string)
// 7. Raw RPC ile gönder
// 8. Onay bekle
//

async function invokeContract(
    signerAddress: string,
    fnName: string,
    fnArgs: xdr.ScVal[],
): Promise<boolean> {
    // ── STEP 1: Simülasyon TX'i oluştur ──
    const account = await getHorizonAccount(signerAddress);
    const simTx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(contract.call(fnName, ...fnArgs))
        .setTimeout(60)
        .build();

    // ── STEP 2: Raw RPC ile simüle et ──
    const sim = await rpc("simulateTransaction", { transaction: simTx.toXDR() });
    if (sim.error) {
        console.error("Simülasyon başarısız:", sim.error);
        return false;
    }

    // ── STEP 3: Sonuçları parse et ──
    const sorobanData = xdr.SorobanTransactionData.fromXDR(
        sim.transactionData, "base64"
    );
    const minResourceFee = parseInt(sim.minResourceFee || "0", 10);
    const authEntries: xdr.SorobanAuthorizationEntry[] = (sim.results?.[0]?.auth || [])
        .map((a: string) => xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));

    // ── STEP 4: Operation'ı SIFIRDAN oluştur (auth dahil) ──
    // Mevcut TX'ten çıkarmak yerine aynı parametrelerle yeniden oluşturuyoruz.
    // Bu, XDR accessor sorunlarını tamamen ortadan kaldırır.
    const invokeContractArgs = new xdr.InvokeContractArgs({
        contractAddress: new Address(CONTRACT_ID).toScAddress(),
        functionName: fnName,
        args: fnArgs,
    });

    const hostFunction = xdr.HostFunction.hostFunctionTypeInvokeContract(
        invokeContractArgs
    );

    const invokeHostFnOp = new xdr.InvokeHostFunctionOp({
        hostFunction: hostFunction,
        auth: authEntries,
    });

    const operation = new (xdr.Operation as any)({
        sourceAccount: null,
        body: xdr.OperationBody.invokeHostFunction(invokeHostFnOp),
    });

    // ── STEP 5: Prepared TX oluştur ──
    const freshAccount = await getHorizonAccount(signerAddress);
    const preparedTx = new TransactionBuilder(freshAccount, {
        fee: (minResourceFee + 100000).toString(), // buffer ekle
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(operation)
        .setSorobanData(sorobanData)
        .setTimeout(60)
        .build();

    // ── STEP 6: Freighter ile imzalat ──
    const preparedXdr = preparedTx.toXDR();
    const signResult = await signTransaction(preparedXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
    });

    const signedXdr = typeof signResult === "string"
        ? signResult
        : (signResult as any).signedTxXdr;

    if (!signedXdr) {
        console.error("İmzalama başarısız");
        return false;
    }

    // ── STEP 7: Raw RPC ile gönder ──
    const sendResult = await rpc("sendTransaction", { transaction: signedXdr });
    if (sendResult.status === "ERROR") {
        console.error("Gönderme başarısız:", sendResult);
        return false;
    }

    // ── STEP 8: Onay bekle ──
    return await waitForConfirmation(sendResult.hash);
}

// ─── YARDIMCI ───────────────────────────────────────────────

async function waitForConfirmation(hash: string): Promise<boolean> {
    for (let i = 0; i < 30; i++) {
        try {
            const result = await rpc("getTransaction", { hash });
            if (result.status === "SUCCESS") return true;
            if (result.status === "FAILED") return false;
        } catch { /* henüz işlenmedi */ }
        await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
}

// ─── PARSE ──────────────────────────────────────────────────

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
