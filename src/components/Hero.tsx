"use client";

import { ArrowRight, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

// --- HERO BİLEŞENİ ---
// Ana sayfa başlığı, alt açıklama ve platform istatistikleri.
// Arkada dekoratif gradient blob animasyonları var.

// Mock platform istatistikleri (Step 3'te kontrattan çekilecek)
const PLATFORM_STATS = [
  { label: "Toplam Fonlanan", value: "1.2M+ XLM", icon: TrendingUp, color: "text-green-400" },
  { label: "Başarılı Proje", value: "140+", icon: Sparkles, color: "text-purple-400" },
  { label: "Aktif Destekçi", value: "12K+", icon: Users, color: "text-blue-400" },
  { label: "Anlık İşlem", value: "<3s", icon: Zap, color: "text-orange-400" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">

      {/* Arka plan dekoratif bloblar */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-600/15 rounded-full blur-[128px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Etiket */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-2 mb-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-purple-300">
        <Sparkles className="w-4 h-4" />
        Stellar Soroban Üzerinde İnşa Edildi
      </div>

      {/* Ana Başlık */}
      <h1 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] max-w-5xl">
        <span className="text-white">Geleceği </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
          Fonla
        </span>
        <br />
        <span className="text-white">Blockchain ile</span>
      </h1>

      {/* Alt Açıklama */}
      <p className="relative z-10 mt-6 text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
        Merkeziyetsiz, şeffaf ve güvenli bağış toplama platformu.
        Stellar ağında saniyeler içinde kampanya oluştur ve destekçilerini bul.
      </p>

      {/* CTA Butonları — ilgili bölümlere smooth scroll */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mt-10">
        <a
          href="#projects"
          className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-[0.97] transition-all duration-300"
        >
          Kampanyaları Keşfet
          <ArrowRight className="w-5 h-5" />
        </a>
        <a
          href="#how-it-works"
          className="px-8 py-4 text-base font-medium text-gray-300 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300"
        >
          Nasıl Çalışır?
        </a>
      </div>

      {/* Platform İstatistikleri */}
      <div className="relative z-10 mt-20 w-full max-w-4xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_-15px_rgba(168,85,247,0.15)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {PLATFORM_STATS.map((stat, i) => {
              const IconComponent = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center space-y-2 group">
                  <div className={`p-3 rounded-full bg-white/5 border border-white/5 ${stat.color} mb-1 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}