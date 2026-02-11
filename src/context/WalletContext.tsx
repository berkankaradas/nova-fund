"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  isConnected as freighterIsConnected,
  isAllowed,
  requestAccess,
  getNetworkDetails,
} from "@stellar/freighter-api";

// --- CÜZDAN CONTEXT ---
// Freighter cüzdan durumunu tüm uygulamaya sağlayan context.
// Tespit, bağlantı, çıkış ve testnet doğrulaması yapar.

// Freighter kurulum linki
const FREIGHTER_INSTALL_URL = "https://www.freighter.app/";

// Desteklenen ağ (sadece Testnet)
const REQUIRED_NETWORK = "TESTNET";

// localStorage anahtarı — sayfa yenilemede cüzdan bağlantısını korumak için
const STORAGE_KEY = "novafund_wallet_address";

interface WalletContextType {
  address: string | null;           // Bağlı cüzdan adresi (G...)
  isWalletConnected: boolean;       // Cüzdan bağlı mı?
  isFreighterInstalled: boolean;    // Freighter yüklü mü?
  isCorrectNetwork: boolean;        // Doğru ağda mı? (Testnet)
  networkName: string | null;       // Mevcut ağ adı
  isLoading: boolean;               // Bağlantı işlemi devam ediyor mu?
  connectWallet: () => Promise<void>;  // Cüzdan bağla
  disconnectWallet: () => void;        // Cüzdan bağlantısını kes
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

// Yardımcı: Public key'i güvenli şekilde al
const retrievePublicKey = async (): Promise<string | null> => {
  try {
    if (typeof window !== "undefined" && (window as any).freighter) {
      const key = await (window as any).freighter.getPublicKey();
      return key || null;
    }
    return null;
  } catch {
    return null;
  }
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ağ bilgisini kontrol et
  const checkNetwork = useCallback(async () => {
    try {
      const details = await getNetworkDetails();

      // Yeni versiyon: obje döner { network: "TESTNET", ... }
      // Eski versiyon: string döner
      let network: string | null = null;

      if (typeof details === "string") {
        network = details;
      } else if (details && typeof details === "object") {
        network = (details as any).network || (details as any).networkPassphrase || null;
      }

      const netName = network?.toUpperCase() || "UNKNOWN";
      setNetworkName(netName);
      setIsCorrectNetwork(netName === REQUIRED_NETWORK);
    } catch {
      setNetworkName(null);
      setIsCorrectNetwork(false);
    }
  }, []);

  // 1. Sayfa yüklendiğinde: Freighter yüklü mü ve daha önce bağlı mı kontrol et
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") return;

      // Freighter'ın DOM'a yüklenmesi için kısa gecikme
      await new Promise((r) => setTimeout(r, 500));

      try {
        const connected = await freighterIsConnected();
        setIsFreighterInstalled(!!connected);

        if (!connected) {
          // Freighter yüklü değilse localStorage'ı temizle
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // Daha önce izin verilmiş mi?
        const allowed = await isAllowed();
        if (allowed) {
          const key = await retrievePublicKey();
          if (key) {
            setAddress(key);
            localStorage.setItem(STORAGE_KEY, key);
          }
        } else {
          // Kaydedilmiş adres varsa ve izin hâlâ geçerliyse yeniden bağlan
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const key = await retrievePublicKey();
            if (key) {
              setAddress(key);
              localStorage.setItem(STORAGE_KEY, key);
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }

        // Ağ kontrolü
        await checkNetwork();
      } catch (e) {
        console.error("Freighter başlangıç kontrol hatası:", e);
      }
    };

    init();
  }, [checkNetwork]);

  // 2. Cüzdan bağlama
  const connectWallet = async () => {
    setIsLoading(true);

    try {
      // Freighter yüklü mü kontrol et
      const connected = await freighterIsConnected();

      if (!connected) {
        // Freighter yüklü değil — kurulum sayfasına yönlendir
        setIsFreighterInstalled(false);
        window.open(FREIGHTER_INSTALL_URL, "_blank");
        setIsLoading(false);
        return;
      }

      setIsFreighterInstalled(true);

      // Kullanıcıdan erişim izni iste (Freighter popup açılır)
      const response: any = await requestAccess();

      let finalAddress: string | null = null;

      if (typeof response === "string") {
        // Eski versiyon: direkt public key döner
        finalAddress = response;
      } else if (response && typeof response === "object" && "address" in response) {
        // Yeni versiyon: { address: "G...", error: "" } döner
        finalAddress = response.address;
      }

      // Eğer yukarıdakiler çalışmazsa bypass ile dene
      if (!finalAddress) {
        finalAddress = await retrievePublicKey();
      }

      if (finalAddress) {
        setAddress(finalAddress);
        localStorage.setItem(STORAGE_KEY, finalAddress);
      }

      // Ağ doğrulaması
      await checkNetwork();
    } catch (error) {
      console.error("Cüzdan bağlantı hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Cüzdan bağlantısını kes
  const disconnectWallet = () => {
    setAddress(null);
    setNetworkName(null);
    setIsCorrectNetwork(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isWalletConnected: !!address,
        isFreighterInstalled,
        isCorrectNetwork,
        networkName,
        isLoading,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Hook: Herhangi bir bileşenden cüzdan durumuna erişim
export const useWallet = () => useContext(WalletContext);