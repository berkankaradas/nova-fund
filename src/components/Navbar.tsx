"use client";

import Link from "next/link";
import { Rocket, Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function Navbar() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();

  // GÜNCELLENMİŞ, GÜVENLİ FONKSİYON
  const formatAddress = (addr?: string | null | any) => {
    if (!addr) return "";
    const safeAddr = String(addr); // Ne gelirse gelsin yazıya çevir
    return `${safeAddr.slice(0, 4)}...${safeAddr.slice(-4)}`;
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/5 bg-black/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <Rocket className="w-5 h-5 text-white transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="self-center text-xl font-bold whitespace-nowrap text-white tracking-wide">
            Nova<span className="text-purple-400">Fund</span>
          </span>
        </Link>

        {/* Cüzdan Butonları */}
        <div className="flex md:order-2">
          {isConnected && address ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-white/5 border border-purple-500/50 rounded-full shadow-[0_0_15px_rgba(132,77,255,0.3)] hover:bg-purple-500/10 transition-colors cursor-default">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-mono tracking-wider text-gray-200">
                  {formatAddress(address)}
                </span>
              </div>
              
              <button 
                onClick={disconnectWallet}
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-red-500/20"
                title="Cüzdan Bağlantısını Kes"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] active:scale-95 transition-all duration-300 group"
            >
              <Wallet className="w-4 h-4 text-white/90 group-hover:rotate-12 transition-transform" />
              Cüzdan Bağla
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}