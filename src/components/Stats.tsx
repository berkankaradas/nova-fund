import { TrendingUp, Users, Wallet, Globe } from "lucide-react";

const STATS = [
  { label: "Toplam Fonlanan (XLM)", value: "1.2M+", icon: TrendingUp, color: "text-green-400" },
  { label: "Başarılı Proje", value: "140+", icon: Globe, color: "text-blue-400" },
  { label: "Aktif Destekçi", value: "12k+", icon: Users, color: "text-purple-400" },
  { label: "Cüzdan Bağlantısı", value: "45k+", icon: Wallet, color: "text-orange-400" },
];

export default function Stats() {
  return (
    <section className="relative z-20 -mt-10 mb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-[#0f0f16]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-2 group">
              <div className={`p-3 rounded-full bg-white/5 border border-white/5 ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h4 className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</h4>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}