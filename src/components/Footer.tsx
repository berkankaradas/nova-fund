import { Rocket, Github, Twitter } from "lucide-react";
import Link from "next/link";

// --- FOOTER BİLEŞENİ ---
// Sayfa alt bilgisi: logo, navigasyon linkleri ve sosyal medya ikonları.

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Logo ve Slogan */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Nova<span className="text-purple-400">Fund</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500">
              Merkeziyetsiz bağış platformu — Stellar üzerinde.
            </p>
          </div>

          {/* Navigasyon Linkleri */}
          <div className="flex gap-8 text-sm text-gray-400">
            <Link href="#projects" className="hover:text-white transition-colors">
              Projeler
            </Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">
              Nasıl Çalışır
            </Link>
            <Link href="#about" className="hover:text-white transition-colors">
              Hakkımızda
            </Link>
          </div>

          {/* Sosyal Medya */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Alt çizgi */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            © 2026 NovaFund. Stellar Soroban üzerinde inşa edilmiştir.
          </p>
        </div>
      </div>
    </footer>
  );
}