"use client";
import { Send, Sparkles } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
        
        {/* Dekoratif Işıklar */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/30 blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-purple-200">
            <Sparkles className="w-4 h-4" />
            <span>Erken Erişim Fırsatlarını Kaçırma</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Topluluğun Bir Parçası Ol
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Haftalık en iyi projeler, airdrop fırsatları ve Stellar ekosisteminden haberler kutuna gelsin.
          </p>

          <form className="max-w-md mx-auto flex gap-2 pt-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="E-posta adresin..." 
              className="flex-1 bg-black/30 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button className="bg-white text-black px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}