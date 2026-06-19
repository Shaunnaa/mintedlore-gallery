import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaWalletProvider } from "@/components/wallet/SolanaWalletProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MintedLore Gallery",
  description: "A Solana NFT storytelling gallery.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex flex-col md:flex-row bg-neutral-950">
        <SolanaWalletProvider>
          <Sidebar />
          <div className="flex-1 min-h-screen">
            {children}
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
