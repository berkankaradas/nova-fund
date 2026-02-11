"use client";

import { ArrowRight, Sparkles } from "lucide-react";

// --- CALL TO ACTION BİLEŞENİ ---
// Son çağrı bölümü: E-posta bülteni kayıt formu ve platforma yönlendirme.
// Step 1: Form UI'ı var ama henüz fonksiyonel değil.

export default function CallToAction() {
  return (
    <section className="py-24 px-4 relative z-20">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-[#0A0A1A] to-pink-600/20 border border-purple-500/20 p-12 md:p-16 text-center shadow-[0_0_80px_-20px_rgba(168,85,247,0.2)]">

          {/* Dekoratif arka plan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* İçerik */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-purple-300">
              <Sparkles className="w-4 h-4" />
              Erken Erişim
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Geleceğin Bir Parçası Ol
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              Yeni kampanyalardan ve platform güncellemelerinden ilk sen haberdar ol.
              Bültene kaydol, Web3 devrimine katıl.
            </p>

            {/* E-posta Kayıt Formu */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="E-posta adresin"
                className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-7 py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-[0.97] transition-all duration-300"
              >
                Katıl
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-xs text-gray-600 mt-4">
              Spam yapmıyoruz. İstediğin zaman çıkabilirsin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}