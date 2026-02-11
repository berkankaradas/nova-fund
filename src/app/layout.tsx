import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

// --- ANA LAYOUT ---
// Tüm sayfaları saran kök bileşen.
// Step 2: WalletProvider ile sarmalandı — cüzdan durumu tüm uygulamada erişilebilir.

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaFund | Stellar Crowdfunding",
  description: "Merkeziyetsiz bağış toplama platformu — Stellar Soroban üzerinde.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${spaceGrotesk.className} antialiased`}>
        {/* Tüm uygulamayı WalletProvider ile sarmalıyoruz */}
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}