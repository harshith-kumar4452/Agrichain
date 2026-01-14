import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/lib/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriChain - Blockchain Supply Chain Transparency",
  description: "Track agricultural produce from farm to table with blockchain-verified transparency",
  keywords: ["blockchain", "supply chain", "agriculture", "traceability", "transparency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen gradient-mesh">
          <Navbar />
          <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}