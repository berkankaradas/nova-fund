import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
// Yeni import:
import { WalletProvider } from "@/context/WalletContext"; 

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaFund | Stellar Crowdfunding",
  description: "Decentralized crowdfunding platform on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        {/* Tüm siteyi WalletProvider ile sarmalıyoruz */}
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}