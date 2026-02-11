"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import HowItWorks from "@/components/HowItWorks";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { getAllCampaigns, CampaignData } from "@/lib/contract";

// --- ANA SAYFA ---
// Tüm bileşenleri birleştirir.
// Step 4: Kontrattan canlı kampanya verisi çeker ve bileşenlere iletir.

export default function Home() {
  // Kontrattan gelen kampanya verileri
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // Kampanya verilerini kontrattan çek
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoadingCampaigns(true);
      const data = await getAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error("Kampanya verisi çekme hatası:", err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, []);

  // Sayfa yüklendiğinde kampanyaları çek
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <main className="min-h-screen flex flex-col bg-[#05050A] text-white overflow-x-hidden selection:bg-purple-500/30">
      {/* 1. Navigasyon */}
      <Navbar />

      {/* 2. Hero Bölümü */}
      <Hero />

      {/* 3. Proje Kartları — canlı veri + bağış sonrası yenileme */}
      <ProjectGrid
        liveCampaigns={campaigns}
        isLoading={isLoadingCampaigns}
        onDonationComplete={fetchCampaigns}
      />

      {/* 4. Nasıl Çalışır */}
      <HowItWorks />

      {/* 5. Son Çağrı (CTA) */}
      <CallToAction />

      {/* 6. Footer */}
      <Footer />
    </main>
  );
}