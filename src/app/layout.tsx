import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaWalletProvider } from "@/components/wallet/SolanaWalletProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Analytics } from "@vercel/analytics/next";
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
  description: "An immersive digital gallery and storytelling ecosystem for NFT communities on Solana. Explore narrative universes, unlock token-gated lore, and curate your public profile.",
  metadataBase: new URL("https://mintedlore-gallery.vercel.app"),
  openGraph: {
    title: "MintedLore Gallery",
    description: "An immersive digital gallery and storytelling ecosystem for NFT communities on Solana.",
    url: "https://mintedlore-gallery.vercel.app",
    siteName: "MintedLore Gallery",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/full-logo.png",
        width: 1200,
        height: 630,
        alt: "MintedLore Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MintedLore Gallery",
    description: "Where digital art comes alive. An immersive storytelling gallery on Solana.",
    site: "@MintedLoreGal",
    creator: "@MintedLoreGal",
    images: ["/full-logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
        <Analytics />
      </body>
    </html>
  );
}
