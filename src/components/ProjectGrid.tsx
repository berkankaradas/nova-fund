"use client";

import { useState } from "react";
import {
    Leaf, Shield, Gamepad2, Cpu, Heart, Globe,
    ArrowUpRight, Lock, Loader2, Check
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { donate as contractDonate, CampaignData } from "@/lib/contract";

// --- PROJE GRID BİLEŞENİ ---
// Kampanya kartlarını gösterir.
// Step 4: Kontrattan gelen canlı veri + Freighter ile bağış yapma.

// Mock kampanyalar (kontrat boşken gösterilir)
const MOCK_PROJECTS = [
    {
        id: 1, title: "EcoDrone AI",
        description: "Yapay zeka destekli dronlar ile otomatik ağaçlandırma.",
        icon: Leaf, color: "text-green-400",
        bgGradient: "from-green-500/20 to-emerald-900/20",
        borderHover: "hover:border-green-500/40",
        raised: 32500, goal: 50000, category: "Çevre", daysLeft: 12,
    },
    {
        id: 2, title: "Quantum Messenger",
        description: "Blockchain tabanlı, uçtan uca şifreleme mesajlaşma.",
        icon: Shield, color: "text-blue-400",
        bgGradient: "from-blue-500/20 to-indigo-900/20",
        borderHover: "hover:border-blue-500/40",
        raised: 45000, goal: 60000, category: "Güvenlik", daysLeft: 5,
    },
    {
        id: 3, title: "Mars Colony VR",
        description: "Ultra gerçekçi sanal gerçeklik simülasyonu.",
        icon: Gamepad2, color: "text-orange-400",
        bgGradient: "from-orange-500/20 to-red-900/20",
        borderHover: "hover:border-orange-500/40",
        raised: 2000, goal: 15000, category: "Oyun", daysLeft: 28,
    },
    {
        id: 4, title: "NeuroLink SDK",
        description: "Beyin-bilgisayar arayüzü için açık kaynak SDK.",
        icon: Cpu, color: "text-purple-400",
        bgGradient: "from-purple-500/20 to-violet-900/20",
        borderHover: "hover:border-purple-500/40",
        raised: 18700, goal: 25000, category: "Teknoloji", daysLeft: 15,
    },
    {
        id: 5, title: "OpenMed DAO",
        description: "Merkeziyetsiz tıbbi araştırma platformu.",
        icon: Heart, color: "text-pink-400",
        bgGradient: "from-pink-500/20 to-rose-900/20",
        borderHover: "hover:border-pink-500/40",
        raised: 8900, goal: 40000, category: "Sağlık", daysLeft: 21,
    },
    {
        id: 6, title: "StellarEdu",
        description: "Blockchain eğitim platformu.",
        icon: Globe, color: "text-cyan-400",
        bgGradient: "from-cyan-500/20 to-teal-900/20",
        borderHover: "hover:border-cyan-500/40",
        raised: 12000, goal: 20000, category: "Eğitim", daysLeft: 9,
    },
];


// İkon, görsel ve açıklama eşleştirme (kampanya ID’sine göre)
const VISUAL_MAP: Record<number, { icon: typeof Leaf; color: string; bgGradient: string; borderHover: string; category: string; description: string }> = {
    1: { icon: Leaf, color: "text-green-400", bgGradient: "from-green-500/20 to-emerald-900/20", borderHover: "hover:border-green-500/40", category: "Çevre", description: "Yapay zeka destekli dronlar ile otomatik ağaçlandırma projesi." },
    2: { icon: Shield, color: "text-blue-400", bgGradient: "from-blue-500/20 to-indigo-900/20", borderHover: "hover:border-blue-500/40", category: "Güvenlik", description: "Blockchain tabanlı, uçtan uca şifrelenmiş mesajlaşma uygulaması." },
    3: { icon: Gamepad2, color: "text-orange-400", bgGradient: "from-orange-500/20 to-red-900/20", borderHover: "hover:border-orange-500/40", category: "Oyun", description: "Ultra gerçekçi Mars koloni sanal gerçeklik simülasyonu." },
    4: { icon: Cpu, color: "text-purple-400", bgGradient: "from-purple-500/20 to-violet-900/20", borderHover: "hover:border-purple-500/40", category: "Teknoloji", description: "Beyin-bilgisayar arayüzü için açık kaynak SDK geliştirme." },
    5: { icon: Heart, color: "text-pink-400", bgGradient: "from-pink-500/20 to-rose-900/20", borderHover: "hover:border-pink-500/40", category: "Sağlık", description: "Merkeziyetsiz tıbbi araştırma ve fonlama platformu." },
    6: { icon: Globe, color: "text-cyan-400", bgGradient: "from-cyan-500/20 to-teal-900/20", borderHover: "hover:border-cyan-500/40", category: "Eğitim", description: "Blockchain teknolojisi eğitim ve sertifika platformu." },
};

// Varsayılan görsel (yeni kampanyalar için)
const DEFAULT_VISUAL = { icon: Globe, color: "text-purple-400", bgGradient: "from-purple-500/20 to-violet-900/20", borderHover: "hover:border-purple-500/40", category: "Proje", description: "Yenilikçi bir blockchain projesi." };

interface ProjectGridProps {
    liveCampaigns?: CampaignData[];
    isLoading?: boolean;
    onDonationComplete?: () => void;
}

export default function ProjectGrid({ liveCampaigns, isLoading, onDonationComplete }: ProjectGridProps) {
    const { isWalletConnected, address, connectWallet } = useWallet();
    const [donatingId, setDonatingId] = useState<number | null>(null);
    const [donateAmounts, setDonateAmounts] = useState<Record<number, string>>({});
    const [donationSuccess, setDonationSuccess] = useState<number | null>(null);
    const [showAllNotice, setShowAllNotice] = useState(false);

    // Kontrattan veri varsa onu kullan, yoksa mock data göster
    const useLiveData = liveCampaigns && liveCampaigns.length > 0;

    // Bağış işlemi
    const handleDonate = async (projectId: number) => {
        if (!isWalletConnected || !address) {
            connectWallet();
            return;
        }

        const amount = parseFloat(donateAmounts[projectId] || "0");
        if (!amount || amount <= 0) {
            alert("Lütfen geçerli bir miktar girin.");
            return;
        }

        setDonatingId(projectId);
        try {
            const success = await contractDonate(projectId, address, amount);
            if (success) {
                setDonationSuccess(projectId);
                // 2 saniye sonra başarı durumunu temizle
                setTimeout(() => setDonationSuccess(null), 2000);
                // Kampanya verilerini yenile
                onDonationComplete?.();
                // Input'u temizle
                setDonateAmounts((prev) => ({ ...prev, [projectId]: "" }));
            } else {
                alert("İşlem başarısız oldu. Lütfen tekrar deneyin.");
            }
        } catch (err) {
            console.error("Bağış hatası:", err);
            alert("Bir hata oluştu.");
        } finally {
            setDonatingId(null);
        }
    };

    // Canlı kampanya kartı render'ı
    const renderLiveCard = (campaign: CampaignData) => {
        const visual = VISUAL_MAP[campaign.id] || DEFAULT_VISUAL;
        const IconComponent = visual.icon;
        const progress = campaign.target > 0 ? Math.round((campaign.raised / campaign.target) * 100) : 0;
        const isDonating = donatingId === campaign.id;
        const isSuccess = donationSuccess === campaign.id;

        return (
            <div
                key={campaign.id}
                className={`group bg-[#0A0A0F]/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500 ${visual.borderHover} flex flex-col`}
            >
                {/* Kart Üst: İkon Alanı */}
                <div className={`h-44 w-full bg-gradient-to-br ${visual.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                    <IconComponent className={`absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] rotate-12 ${visual.color}`} />
                    <div className="relative z-10 bg-black/20 backdrop-blur-xl p-5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <IconComponent className={`w-12 h-12 ${visual.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
                    </div>
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white border border-white/5">
                        {visual.category}
                    </div>
                    {/* On-chain etiketi */}
                    <div className="absolute top-4 right-4 bg-green-500/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-green-400 border border-green-500/20">
                        🔗 On-Chain
                    </div>
                </div>

                {/* Kart Alt: İçerik */}
                <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {campaign.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        {visual.description}
                    </p>
                    <p className="text-gray-500 text-xs mb-4 font-mono">
                        Yaratıcı: {campaign.creator.slice(0, 4)}...{campaign.creator.slice(-4)}
                    </p>

                    {/* İlerleme Çubuğu */}
                    <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className={visual.color}>{Math.min(progress, 100)}% tamamlandı</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${visual.color.replace("text-", "bg-")}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <div>
                                <p className="text-xs text-gray-500">Toplanan</p>
                                <p className="text-base font-bold text-white">{campaign.raised.toLocaleString("tr-TR")} XLM</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Hedef</p>
                                <p className="text-sm text-gray-300">{campaign.target.toLocaleString("tr-TR")} XLM</p>
                            </div>
                        </div>

                        {/* Bağış Input + Buton */}
                        {isWalletConnected && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="number"
                                    placeholder="XLM"
                                    value={donateAmounts[campaign.id] || ""}
                                    onChange={(e) => setDonateAmounts((prev) => ({ ...prev, [campaign.id]: e.target.value }))}
                                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    disabled={isDonating}
                                />
                                <button
                                    onClick={() => handleDonate(campaign.id)}
                                    disabled={isDonating}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${isSuccess
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-[0.97]"
                                        } disabled:opacity-50`}
                                >
                                    {isDonating ? <Loader2 className="w-4 h-4 animate-spin" /> : isSuccess ? <Check className="w-4 h-4" /> : null}
                                    {isDonating ? "..." : isSuccess ? "Tamam" : "Gönder"}
                                </button>
                            </div>
                        )}

                        {/* Cüzdan bağlı değilse kilit butonu */}
                        {!isWalletConnected && (
                            <button
                                onClick={() => connectWallet()}
                                className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                Cüzdan Bağla
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Mock kart render'ı (kontrat boşken)
    const renderMockCard = (project: typeof MOCK_PROJECTS[0]) => {
        const IconComponent = project.icon;
        const progress = Math.round((project.raised / project.goal) * 100);
        const isDonating = donatingId === project.id;
        const isSuccess = donationSuccess === project.id;

        return (
            <div
                key={project.id}
                className={`group bg-[#0A0A0F]/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500 ${project.borderHover} flex flex-col`}
            >
                <div className={`h-44 w-full bg-gradient-to-br ${project.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                    <IconComponent className={`absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] rotate-12 ${project.color}`} />
                    <div className="relative z-10 bg-black/20 backdrop-blur-xl p-5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <IconComponent className={`w-12 h-12 ${project.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
                    </div>
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white border border-white/5">{project.category}</div>
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-gray-300 border border-white/5">{project.daysLeft} gün kaldı</div>
                </div>
                <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{project.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{project.description}</p>
                    <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className={project.color}>{progress}% tamamlandı</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${project.color.replace("text-", "bg-")}`} style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <div>
                                <p className="text-xs text-gray-500">Toplanan</p>
                                <p className="text-base font-bold text-white">{project.raised.toLocaleString("tr-TR")} XLM</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Hedef</p>
                                <p className="text-sm text-gray-300">{project.goal.toLocaleString("tr-TR")} XLM</p>
                            </div>
                        </div>

                        {/* Bağış Input + Buton — cüzdan bağlıysa göster */}
                        {isWalletConnected && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="number"
                                    placeholder="XLM"
                                    value={donateAmounts[project.id] || ""}
                                    onChange={(e) => setDonateAmounts((prev) => ({ ...prev, [project.id]: e.target.value }))}
                                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    disabled={isDonating}
                                />
                                <button
                                    onClick={() => handleDonate(project.id)}
                                    disabled={isDonating}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${isSuccess
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-[0.97]"
                                        } disabled:opacity-50`}
                                >
                                    {isDonating ? <Loader2 className="w-4 h-4 animate-spin" /> : isSuccess ? <Check className="w-4 h-4" /> : null}
                                    {isDonating ? "..." : isSuccess ? "Tamam" : "Gönder"}
                                </button>
                            </div>
                        )}

                        {/* Cüzdan bağlı değilse kilit butonu */}
                        {!isWalletConnected && (
                            <button
                                onClick={() => connectWallet()}
                                className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Lock className="w-3.5 h-3.5" /> Cüzdan Bağla
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="projects" className="py-24 px-4 relative z-20">
            <div className="max-w-7xl mx-auto">
                {/* Bölüm Başlığı */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
                    <div className="space-y-3">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {useLiveData ? (
                                <>Canlı <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Kampanyalar</span></>
                            ) : (
                                <>Öne Çıkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Projeler</span></>
                            )}
                        </h2>
                        <p className="text-gray-400 max-w-xl text-lg">
                            {useLiveData
                                ? "Stellar Soroban kontratından canlı olarak çekilen kampanyalar."
                                : "Stellar ağında geliştirilen en yenilikçi girişimleri keşfedin."
                            }
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const totalCount = useLiveData ? liveCampaigns!.length : MOCK_PROJECTS.length;
                            if (totalCount <= 6) {
                                setShowAllNotice(true);
                                setTimeout(() => setShowAllNotice(false), 3000);
                            }
                        }}
                        className="flex items-center gap-2 text-white border border-white/10 px-6 py-3 rounded-xl hover:bg-white/5 transition-colors relative"
                    >
                        Tümünü Gör <ArrowUpRight className="w-4 h-4" />
                        {/* Uyarı baloncuğu */}
                        {showAllNotice && (
                            <span className="absolute -bottom-12 right-0 bg-white/10 backdrop-blur-xl text-gray-300 text-xs px-4 py-2 rounded-xl border border-white/10 whitespace-nowrap animate-pulse">
                                Tüm kampanyalar zaten görüntüleniyor ✓
                            </span>
                        )}
                    </button>
                </div>

                {/* Loading durumu */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                        <span className="ml-3 text-gray-400">Kampanyalar yükleniyor...</span>
                    </div>
                )}

                {/* Kartlar */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {useLiveData
                            ? liveCampaigns.map(renderLiveCard)
                            : MOCK_PROJECTS.map(renderMockCard)
                        }
                    </div>
                )}

                {/* Canlı veri yokken bilgi */}
                {!isLoading && useLiveData && liveCampaigns.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        Henüz kampanya oluşturulmamış. İlk kampanyayı sen oluştur!
                    </div>
                )}
            </div>
        </section>
    );
}
