"use client";

import Link from "next/link";
import { Rocket, Wallet, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

// --- NAVBAR BİLEŞENİ ---
// Logo, navigasyon linkleri ve Freighter cüzdan bağlantısı.
// Step 2: Gerçek cüzdan bağlantısı aktif.

export default function Navbar() {
  const {
    address,
    isWalletConnected,
    isCorrectNetwork,
    networkName,
    isLoading,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  // Adresi kısaltma: GABC...WXYZ
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/5 bg-black/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <Rocket className="w-5 h-5 text-white transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Nova<span className="text-purple-400">Fund</span>
          </span>
        </Link>

        {/* Navigasyon Linkleri */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#projects" className="text-sm text-gray-400 hover:text-white transition-colors">
            Projeler
          </Link>
          <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
            Nasıl Çalışır
          </Link>
          <Link href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">
            Hakkımızda
          </Link>
        </div>

        {/* Cüzdan Alanı */}
        <div className="flex items-center gap-3">
          {isWalletConnected && address ? (
            <>
              {/* Yanlış ağ uyarısı */}
              {!isCorrectNetwork && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{networkName || "Bilinmeyen"} — Testnet&apos;e geçin</span>
                </div>
              )}

              {/* Testnet etiketi */}
              {isCorrectNetwork && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Testnet
                </div>
              )}

              {/* Adres gösterimi */}
              <div className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-white/5 border border-purple-500/50 rounded-full shadow-[0_0_15px_rgba(132,77,255,0.3)] hover:bg-purple-500/10 transition-colors cursor-default">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono tracking-wider text-gray-200">
                  {formatAddress(address)}
                </span>
              </div>

              {/* Çıkış butonu */}
              <button
                onClick={disconnectWallet}
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-red-500/20"
                title="Cüzdan Bağlantısını Kes"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            /* Bağlanma butonu */
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] active:scale-95 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4 text-white/90 group-hover:rotate-12 transition-transform" />
              )}
              {isLoading ? "Bağlanıyor..." : "Cüzdan Bağla"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}