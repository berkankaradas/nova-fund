import { Rocket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-black/20 py-8 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-purple-500" />
          <p>© 2026 NovaFund. Stellar Network üzerinde geliştirilmiştir.</p>
        </div>
        
        <div className="flex gap-6">
          <a href="#" className="hover:text-purple-400 transition-colors">GitHub</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Docs</a>
        </div>
      </div>
    </footer>
  );
}