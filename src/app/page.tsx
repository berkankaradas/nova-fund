import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import FeaturedProjects from "@/components/FeaturedProjects";
import HowItWorks from "@/components/HowItWorks";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#05050A] text-white overflow-x-hidden selection:bg-purple-500/30">
      
      {/* 1. Navbar */}
      <Navbar />
      
      {/* 2. Hero (Giriş) */}
      <Hero />
      
      {/* 3. İstatistikler (Hero'nun altına şık bir şekilde biner) */}
      <Stats />
      
      {/* 4. Öne Çıkan Projeler */}
      <FeaturedProjects />

      {/* 5. Nasıl Çalışır? (Eğitim Bölümü) */}
      <HowItWorks />
      
      {/* 6. Son Çağrı (Newsletter) */}
      <CallToAction />
      
      {/* 7. Footer */}
      <Footer />
      
    </main>
  );
}