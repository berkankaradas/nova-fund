import { Wallet, Search, Gift } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Cüzdanını Bağla",
    desc: "Freighter veya Albedo cüzdanınla saniyeler içinde Stellar ağına bağlan. Kimlik doğrulama gerekmez.",
    icon: Wallet,
  },
  {
    id: 2,
    title: "Geleceği Seç",
    desc: "Yüzlerce inovatif proje arasından vizyonuna inandığın girişimi bul ve XLM ile destekle.",
    icon: Search,
  },
  {
    id: 3,
    title: "Ödülünü Al",
    desc: "Desteğin karşılığında projeye özel NFT veya Token ödüllerin otomatik olarak cüzdanına yatsın.",
    icon: Gift,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-black/20 border-y border-white/5 relative overflow-hidden">
      {/* Arka Plan Efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Sistem <span className="text-purple-500">Nasıl Çalışır?</span>
          </h2>
          <p className="text-gray-400">Merkeziyetsiz fonlama dünyasına 3 adımda giriş yapın.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Çizgi Efekti (Sadece Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent z-0" />

          {STEPS.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0A0A0F] border-4 border-[#1a1a24] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(132,77,255,0.3)]">
                <step.icon className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 max-w-xs leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}