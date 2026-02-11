import { ArrowRight, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stellar-950/50 border border-stellar-500/30 text-sm text-stellar-300 backdrop-blur-sm animate-fade-in-up">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Powered by Stellar Network</span>
        </div>
        
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white animate-fade-in-up [animation-delay:200ms] drop-shadow-2xl">
          Geleceği <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-400 via-purple-300 to-blue-400">
            Merkeziyetsiz
          </span> Fonla.
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
          Geleneksel aracıları ortadan kaldırın. Stellar ağının hızı ve düşük maliyetleriyle 
          projelerinizi hayata geçirin, topluluk odaklı bir gelecek inşa edin.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-fade-in-up [animation-delay:600ms]">
          <button className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group">
            Projeleri İncele
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm">
            Hemen Başla
          </button>
        </div>
      </div>
    </section>
  );
}