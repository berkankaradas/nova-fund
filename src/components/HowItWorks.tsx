"use client";

import { Wallet, Search, Send, CheckCircle } from "lucide-react";

// --- NASIL ÇALIŞIR BİLEŞENİ ---
// 4 adımdan oluşan platform kullanım rehberi.
// Numaralı kartlar ve ikon ile görsel anlatım.

const STEPS = [
  {
    step: "01",
    title: "Cüzdan Bağla",
    description: "Freighter cüzdanınızı bağlayarak Stellar ağına güvenli şekilde erişin.",
    icon: Wallet,
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
  },
  {
    step: "02",
    title: "Projeleri Keşfet",
    description: "Fonlama bekleyen yenilikçi projeleri inceleyin ve favorilerinizi seçin.",
    icon: Search,
    color: "text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    step: "03",
    title: "Bağışını Yap",
    description: "XLM ile güvenli bir şekilde seçtiğiniz projeye bağış yapın.",
    icon: Send,
    color: "text-pink-400",
    borderColor: "border-pink-500/20",
  },
  {
    step: "04",
    title: "Takip Et",
    description: "Bağışlarınızın etkisini on-chain olarak şeffaf biçimde izleyin.",
    icon: CheckCircle,
    color: "text-green-400",
    borderColor: "border-green-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative z-20">
      <div className="max-w-6xl mx-auto">

        {/* Başlık */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Nasıl{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Çalışır?
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            4 kolay adımda merkeziyetsiz bağış dünyasına katılın.
          </p>
        </div>

        {/* Adım Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className={`group relative bg-white/5 backdrop-blur-xl border ${item.borderColor} rounded-3xl p-8 text-center hover:bg-white/[0.08] transition-all duration-300`}
              >
                {/* Numara */}
                <span className="absolute top-4 right-4 text-5xl font-black text-white/[0.03] select-none">
                  {item.step}
                </span>

                {/* İkon */}
                <div className={`inline-flex p-4 rounded-2xl bg-white/5 border border-white/5 ${item.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}