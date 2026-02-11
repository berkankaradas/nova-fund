import Link from "next/link"; // Link bileşenini ekledik
import { 
  Users, 
  Clock, 
  Leaf, 
  Shield, 
  Gamepad2, 
  ArrowUpRight 
} from "lucide-react";

const PROJECTS = [
  {
    id: 1,
    title: "EcoDrone AI",
    description: "Yapay zeka destekli dronlar ile ulaşılması zor alanlarda otomatik ağaçlandırma.",
    icon: Leaf,
    color: "text-green-400",
    bg: "from-green-500/20 to-emerald-900/20",
    border: "group-hover:border-green-500/50",
    category: "Environment",
    raised: 12500,
    goal: 50000,
    creator: "GreenTech",
    daysLeft: 12
  },
  {
    id: 2,
    title: "Quantum Messenger",
    description: "Blockchain tabanlı, kırılamaz şifreleme sunan yeni nesil mesajlaşma ağı.",
    icon: Shield,
    color: "text-blue-400",
    bg: "from-blue-500/20 to-indigo-900/20",
    border: "group-hover:border-blue-500/50",
    category: "Security",
    raised: 45000,
    goal: 60000,
    creator: "CipherLabs",
    daysLeft: 5
  },
  {
    id: 3,
    title: "Mars Colony VR",
    description: "Kızıl gezegeni evinizden deneyimleyin. Ultra gerçekçi VR simülasyonu.",
    icon: Gamepad2,
    color: "text-orange-400",
    bg: "from-orange-500/20 to-red-900/20",
    border: "group-hover:border-orange-500/50",
    category: "Gaming",
    raised: 2000,
    goal: 15000,
    creator: "RedDust",
    daysLeft: 28
  }
];

export default function FeaturedProjects() {
  return (
    <section className="py-24 px-4 relative z-20"> {/* z-20 ekledik ki üstte kalsın */}
      <div className="max-w-7xl mx-auto">
        
        {/* Başlık ve Buton */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Öne Çıkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Projeler</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-lg">
              Stellar ağında geliştirilen en yenilikçi dApp'leri ve girişimleri keşfedin.
            </p>
          </div>
          {/* Butonu Link yaptık */}
          <Link href="/projects" className="text-white border border-white/10 px-6 py-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2 cursor-pointer z-30">
            Tümünü Gör <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => {
            const progress = (project.raised / project.goal) * 100;
            const IconComponent = project.icon;
            
            return (
              /* BURASI DEĞİŞTİ: Div yerine Link kullandık */
              <Link 
                href={`/project/${project.id}`} 
                key={project.id} 
                className={`group bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 ${project.border} flex flex-col cursor-pointer relative z-30`}
              >
                
                {/* 1. İKON ALANI */}
                <div className={`h-56 w-full bg-gradient-to-br ${project.bg} flex items-center justify-center relative overflow-hidden`}>
                  <IconComponent className={`absolute -right-10 -bottom-10 w-64 h-64 opacity-5 rotate-12 ${project.color}`} />
                  
                  <div className="relative z-10 bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <IconComponent className={`w-16 h-16 ${project.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} />
                  </div>

                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white border border-white/5">
                    {project.category}
                  </div>
                </div>

                {/* 2. İÇERİK ALANI */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-5">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${project.color.replace('text', 'bg')}`} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Toplanan</p>
                        <p className="text-lg font-bold text-white">{project.raised.toLocaleString()} XLM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Hedef</p>
                        <p className="text-gray-300">{project.goal.toLocaleString()} XLM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}