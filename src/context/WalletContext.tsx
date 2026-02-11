"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// Güvenilir fonksiyonları import ediyoruz
import { isConnected, requestAccess } from "@stellar/freighter-api";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

// Yardımcı Fonksiyon: Güvenli Şekilde Public Key Alır (Bypass Yöntemi)
const retrievePublicKey = async (): Promise<string | null> => {
  try {
    if (typeof window !== "undefined" && (window as any).freighter) {
      const key = await (window as any).freighter.getPublicKey();
      return key;
    }
    return null;
  } catch (error) {
    console.error("Public key alınamadı:", error);
    return null;
  }
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  // 1. Sayfa yüklendiğinde otomatik kontrol
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await isConnected();
        if (connected) {
          const key = await retrievePublicKey();
          if (key) setAddress(key);
        }
      } catch (e) {
        console.error("Otomatik bağlanma hatası:", e);
      }
    };
    
    if (typeof window !== "undefined") {
      setTimeout(checkConnection, 500);
    }
  }, []);

  // 2. Butona basılınca bağlanma
  const connectWallet = async () => {
    try {
      const installed = await isConnected();
      
      if (!installed) {
        alert("Lütfen Freighter cüzdanını tarayıcınıza yükleyin.");
        return;
      }

      // Kullanıcıdan izin iste (Pencere açılır)
      // BURASI DÜZELTİLDİ: Gelen yanıtın tipine göre işlem yapıyoruz
      const response: any = await requestAccess();
      
      let finalAddress: string | null = null;

      if (typeof response === 'string') {
        // Eğer direkt string geldiyse (Eski versiyonlar)
        finalAddress = response;
      } else if (response && typeof response === 'object' && 'address' in response) {
        // Eğer obje geldiyse (Yeni versiyonlar) -> { address: "GB...", error: ... }
        finalAddress = response.address;
      }

      if (finalAddress) {
         setAddress(finalAddress);
      } else {
         // Eğer yukarıdakiler boş dönerse manuel çekmeyi dene
         const key = await retrievePublicKey();
         if (key) setAddress(key);
      }
      
    } catch (error) {
      console.error("Cüzdan bağlantı hatası:", error);
      alert("Bağlantı sırasında bir hata oluştu.");
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);